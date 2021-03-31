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

import '../shared/expandable_content/expandable_tab.js';
import '../shared/dropdown/dropdown.js';
import '../shared/section_row/section_row.js';
import '../shared/slider_with_input/slider_with_input.js';
import '../shared/checkbox/checkbox.js';
import '@polymer/paper-item';
import '@material/mwc-button';
import '../file_modal/file_modal.js';

import {IMAGE_MIME_TYPES, ModelViewerConfig} from '@google/model-viewer-editing-adapter/lib/main.js'
import {customElement, html, internalProperty, query} from 'lit-element';

import {reduxStore} from '../../space_opera_base.js';
import {iblSelectorStyles} from '../../styles.css.js';
import {State} from '../../types.js';
import {dispatchEnvrionmentImage, dispatchExposure, dispatchShadowIntensity, dispatchShadowSoftness, dispatchUseEnvAsSkybox, getConfig} from '../config/reducer.js';
import {ConnectedLitElement} from '../connected_lit_element/connected_lit_element.js';
import {FileModalElement} from '../file_modal/file_modal.js';
import {dispatchSetEnvironmentName} from '../relative_file_paths/reducer.js';
import {CheckboxElement} from '../shared/checkbox/checkbox.js';
import {Dropdown} from '../shared/dropdown/dropdown.js';
import {SliderWithInputElement} from '../shared/slider_with_input/slider_with_input.js';

import {createBlobUrlFromEnvironmentImage, dispatchAddEnvironmentImage, getEnvironmentImages} from './reducer.js';
import {DEFAULT_EXPOSURE, DEFAULT_SHADOW_INTENSITY, DEFAULT_SHADOW_SOFTNESS, EnvironmentImage} from './types.js';

const ACCEPT_IMAGE_TYPE = IMAGE_MIME_TYPES.join(',') + ',.hdr';

/**
 * IBL environment selector.
 */
@customElement('me-ibl-selector')
export class IblSelector extends ConnectedLitElement {
  static styles = iblSelectorStyles;

  @internalProperty() config: ModelViewerConfig = {};
  @internalProperty() environmentImages: EnvironmentImage[] = [];

  @query('me-slider-with-input#exposure')
  exposureSlider!: SliderWithInputElement;
  @query('me-file-modal#imageUpload') imageFileModal!: FileModalElement;
  @query('me-checkbox#skybox') skyboxCheckbox!: CheckboxElement;

  @query('me-slider-with-input#shadow-intensity')
  shadowIntensitySlider!: SliderWithInputElement;
  @query('me-slider-with-input#shadow-softness')
  shadowSoftnessSlider!: SliderWithInputElement;

  // Specifically overriding a super class method.
  // tslint:disable-next-line:enforce-name-casing
  async _getUpdateComplete() {
    await super._getUpdateComplete();
    await this.exposureSlider.updateComplete;
    await this.skyboxCheckbox.updateComplete;
    await this.shadowIntensitySlider.updateComplete;
    await this.shadowSoftnessSlider.updateComplete;
  }

  stateChanged(state: State) {
    this.config = getConfig(state);
    this.environmentImages = getEnvironmentImages(state);
  }

  onSelectEnvironmentImage(event: CustomEvent) {
    const dropdownElement = event.target as Dropdown;
    // Polymer dropdown emits an deselect event before selection, we need to
    // filter that out
    if (dropdownElement.selectedItem &&
        dropdownElement.selectedItem.getAttribute('value') !==
            this.config.environmentImage) {
      reduxStore.dispatch(dispatchEnvrionmentImage(
          dropdownElement.selectedItem.getAttribute('value') || undefined));
      // dropdown value equals null when "Default" is selected
      if (dropdownElement.selectedItem.getAttribute('value') === null) {
        reduxStore.dispatch(dispatchSetEnvironmentName(undefined));
      } else {
        const envImageList =
            dropdownElement.selectedItem.getAttribute('value')?.split('/');
        const envImageName = envImageList![envImageList!.length - 1];
        reduxStore.dispatch(dispatchSetEnvironmentName(envImageName));
      }
    }
  }

  onExposureChange() {
    reduxStore.dispatch(dispatchExposure(this.exposureSlider.value));
  }

  onUseEnvAsSkyboxChange() {
    reduxStore.dispatch(dispatchUseEnvAsSkybox(this.skyboxCheckbox.checked));
  }

  onShadowIntensityChange() {
    reduxStore.dispatch(
        dispatchShadowIntensity(this.shadowIntensitySlider.value));
  }

  onShadowSoftnessChange() {
    reduxStore.dispatch(
        dispatchShadowSoftness(this.shadowSoftnessSlider.value));
  }

  // TODO:: Add test to this.
  async openFileModal() {
    const files = await this.imageFileModal.open();

    if (!files) {
      return;
    }

    const file = files[0] as File;
    const unsafeUrl = await createBlobUrlFromEnvironmentImage(file);

    reduxStore.dispatch(
        dispatchAddEnvironmentImage({uri: unsafeUrl, name: file.name}));
    reduxStore.dispatch(dispatchEnvrionmentImage(unsafeUrl));
    reduxStore.dispatch(dispatchSetEnvironmentName(file.name));
  }

  // TODO: On snippet input if IBL is defined, select the
  // correct option from the dropdown.
  render() {
    const selectedIndex = this.config.environmentImage ?
        this.environmentImages.findIndex(
            (image) => image.uri === this.config.environmentImage) +
            1 :
        0;  // 0 is the default state
    return html`
      <me-expandable-tab tabName="Lighting" .open=${true}>
        <div slot="content">
          <div class="HeaderLabel">Environment Image:</div>
          <div style="display: flex; justify-content: space-between">
            <me-dropdown
              class="EnvironmnetImageDropdown"
              selectedIndex=${selectedIndex}
              style="align-self: center; width: 70%;"
              @select=${this.onSelectEnvironmentImage}>
              <paper-item>Default</paper-item>
              ${
        this.environmentImages.map(
            environmentImage => html`<paper-item value=${
                environmentImage.uri}>${environmentImage.name}</paper-item>`)}
            </me-dropdown>
            <mwc-button 
              class="UploadButton"
              style="align-self: center;"
              id="uploadButton" unelevated
              icon="file_upload" @click="${this.openFileModal}">HDR</mwc-button>
          </div>
          <me-section-row class="Row" label="Exposure">
            <me-slider-with-input min="0" max="2" step="0.01" id="exposure"
              @change="${this.onExposureChange}"
              value="${this.config.exposure ?? DEFAULT_EXPOSURE}">
            </me-slider-with-input>
          </me-section-row>
          <me-checkbox 
            id="skybox" 
            label="Use Environment as Skybox"
            ?checked="${!!this.config.useEnvAsSkybox}"
            @change=${this.onUseEnvAsSkyboxChange}
            >
          </me-checkbox>
          ${
        selectedIndex === 0 && this.config.useEnvAsSkybox ?
            html`<div class="defaultError"><small>Choose a non-default environment</small></div>` :
            html``}
          <me-section-row class="Row" label="Shadow Intensity">
            <me-slider-with-input min="0" max="10" step="0.1" id="shadow-intensity"
              @change="${this.onShadowIntensityChange}"
              value="${
        this.config.shadowIntensity ?? DEFAULT_SHADOW_INTENSITY}">
            </me-slider-with-input>
          </me-section-row>

          <me-section-row class="Row" label="Shadow Softness">
            <me-slider-with-input min="0" max="1" step="0.01" id="shadow-softness"
              @change="${this.onShadowSoftnessChange}"
              value="${this.config.shadowSoftness ?? DEFAULT_SHADOW_SOFTNESS}">
            </me-slider-with-input>
          </me-section-row>

          <me-file-modal id="imageUpload" accept=${ACCEPT_IMAGE_TYPE}>
          </me-file-modal>
        </div>
      </me-expandable-tab>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'me-ibl-selector': IblSelector;
  }
}
