/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import '@material/mwc-button';

import {GltfModel, ModelViewerConfig} from '@google/model-viewer-editing-adapter/lib/main.js'
import {safeDownloadCallback} from '@google/model-viewer-editing-adapter/lib/util/safe_download_callback.js'
// tslint:disable-next-line:enforce-name-casing JSZip is a class.
import JSZip from 'jszip';
import {css, customElement, html, internalProperty} from 'lit-element';

import {RelativeFilePathsState, State} from '../../../types.js';
import {getConfig} from '../../config/reducer.js';
import {ConnectedLitElement} from '../../connected_lit_element/connected_lit_element.js';
import {getGltfModel} from '../../model_viewer_preview/reducer.js';
import {getRelativeFilePaths} from '../../relative_file_paths/reducer.js';

interface Payload {
  blob: Blob;
  filename: string;
  contentType?: string;
}

/**
 * A generic button base class for downloading file resources.
 */
class GenericDownloadButton extends ConnectedLitElement {
  static get styles() {
    return css`
        :host {--mdc-button-disabled-fill-color: rgba(255,255,255,.88)}
        `;
  }

  @internalProperty() buttonLabel = '';
  @internalProperty() preparePayload?: () => Promise<Payload|null>;

  // NOTE: Because this is async, it is possible for multiple downloads to be
  // kicked off at once. But this is unlikely, and each download has no
  // side-effects anyway, so nothing bad can happen.
  async onDownloadClick() {
    const payload = await this.preparePayload!();
    if (!payload)
      return;
    await safeDownloadCallback(
        payload.blob, payload.filename, payload.contentType ?? '')();
  }

  render() {
    return html`<mwc-button unelevated
        icon="file_download"
        ?disabled=${!this.preparePayload}
        @click=${this.onDownloadClick}>
          ${this.buttonLabel}</mwc-button>`;
  }
}

async function prepareGlbPayload(
    gltf: GltfModel, modelName: string): Promise<Payload> {
  const glbBuffer = await gltf.packGlb();
  return {
    blob: new Blob([glbBuffer], {type: 'model/gltf-binary'}),
    filename: modelName,
    contentType: ''
  };
}

/**
 * Add elements to ZIP as necessary.
 */
async function prepareZipArchive(
    gltf: GltfModel,
    config: ModelViewerConfig,
    data: {snippetText: string},
    relativeFilePaths: RelativeFilePathsState): Promise<Payload> {
  const zip = new JSZip();

  const glb = await prepareGlbPayload(gltf, relativeFilePaths.modelName!);
  zip.file(glb.filename, glb.blob);

  // check if legal envrionment url
  if (config.environmentImage) {
    const response = await fetch(config.environmentImage);
    if (!response.ok) {
      throw new Error(`Failed to fetch url ${config.environmentImage}`);
    }
    zip.file(relativeFilePaths.environmentName!, response.blob());
  }

  // check if legal poster url
  if (config.poster) {
    const response = await fetch(config.poster);
    if (!response.ok) {
      throw new Error(`Failed to fetch url ${config.poster}`);
    }
    zip.file(relativeFilePaths.posterName!, response.blob());
  }

  zip.file('snippet.txt', data.snippetText);

  return {
    blob: await zip.generateAsync({type: 'blob', compression: 'DEFLATE'}),
    filename: 'model.zip'
  };
}

/**
 * A button to download GLB file resources.
 */
@customElement('me-download-button')
export class DownloadButton extends GenericDownloadButton {
  constructor() {
    super();
    this.buttonLabel = 'GLB';
  }

  stateChanged(state: State) {
    const gltf = getGltfModel(state);
    const modelName = getRelativeFilePaths(state).modelName!;
    this.preparePayload =
        gltf ? () => prepareGlbPayload(gltf, modelName) : undefined;
  }
}

/**
 * A button to download all file resources as a ZIP.
 */
@customElement('me-export-zip-button')
export class ExportZipButton extends GenericDownloadButton {
  snippetText: string = '';

  constructor() {
    super();
    this.buttonLabel = 'ZIP';
  }

  stateChanged(state: State) {
    const config = getConfig(state);
    const gltf = getGltfModel(state);
    const relativeFilePaths = getRelativeFilePaths(state);
    if (!gltf) {
      this.preparePayload = undefined;
      return;
    }

    const urls = new Array<string>();
    if (config.environmentImage) {
      urls.push(config.environmentImage);
    }

    // Note that snippet text will necessarily be set manually post-update,
    // and therefore we must pass a containing object (in our case, this) by
    // reference.
    this.preparePayload = () =>
        prepareZipArchive(gltf, config, this, relativeFilePaths);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'me-download-button': DownloadButton;
    'me-export-zip-button': ExportZipButton;
  }
}
