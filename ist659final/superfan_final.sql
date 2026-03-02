-- Functions and views for Bands, Artists and Instruments
-- Note: Run each function / view / index itself indivually, then the test case for it.
-- Dan Pacheco

use superfan;
go

-- 1. FUNCTION: BandArtists. Gives you a table that shows which artists are in which bands

create or alter function dbo.fn_BandArtists (@band_id int)
returns table
as 
return 

(
    select a.artist_id, a.artist_name, a.band_id
    from dbo.artists as a
    where a.band_id = @band_id
);
go

-- Test BandArtists function to show artists who are in bands based on band number in parens
-- Change number to get different results. Note that some list multiple members:

select *
from dbo.fn_BandArtists(3);

select *
from dbo.fn_BandArtists(7);

select *
from dbo.fn_BandArtists(11);


-- 2. VIEW artists_with_instruments: Shows a roster of artists in bands with their instruments

use superfan
go

create or alter view dbo.v_artists_with_instruments
as
select 
    b.band_id,
    b.band_name,
    a.artist_id,
    a.artist_name,
    i.instrument_id,
    i.instrument_name
from dbo.artists as a

join dbo.bands as b
on b.band_id = a.band_id

join dbo.artist_instruments as ai
on ai.artist_id = a.artist_id

join dbo.instruments as i
on i.instrument_id = ai.instrument_id;
go

-- Test the artists_with_instruments view:

select *
from dbo.v_artists_with_instruments
order by band_name, artist_name, instrument_name

GO
-- 3. VIEW v_band_roster_with_instruments.
-- Shows band roster with aggregated instruments per artist

CREATE or ALTER view dbo.v_band_roster_with_instruments
as
select
    b.band_id,
    b.band_name,
    a.artist_id,
    a.artist_name,
    STRING_AGG(i.instrument_name, ', ') as instruments_played
from dbo.artists as a
join dbo.bands as b
  on b.band_id = a.band_id
left join dbo.artist_instruments as ai
  on ai.artist_id = a.artist_id
left join dbo.instruments as i
  on i.instrument_id = ai.instrument_id
group by
    b.band_id, b.band_name,
    a.artist_id, a.artist_name;
go

-- Test the v_band_roster_with_instruments view

select * from dbo.v_band_roster_with_instruments

go

-- 4. STORED PROCEDURE p_search_artists
-- Lets you search for artists by text in the name, or the band
-- Uses like to help you find a band even if you only know part of the name.

CREATE OR ALTER FUNCTION dbo.fn_Normalize (@s NVARCHAR(4000))
RETURNS NVARCHAR(4000)
AS
BEGIN
    RETURN LOWER(LTRIM(RTRIM(ISNULL(@s, N''))));
END
GO

create or alter PROCEDURE dbo.p_search_artists
    @q nvarchar(200) = null,   -- free-text for artist/band
    @band_id int = null   -- optional exact band filter
as
begin
    set nocount on;
    declare @qNorm nvarchar(4000) = dbo.fn_Normalize(@q);

    select
        v.band_id,
        v.band_name,
        v.artist_id,
        v.artist_name,
        v.instruments_played
    from dbo.v_band_roster_with_instruments as v
    where (@band_id is null or v.band_id = @band_id)
      and (
            @qNorm is null
         or dbo.fn_Normalize(v.artist_name) like '%' + @qNorm + '%'
         or dbo.fn_Normalize(v.band_name)   like '%' + @qNorm + '%'
      )
    order by v.band_name, v.artist_name;
end
go

-- Test the p_search_artists procedure

-- Test csase 1) No filters (returns all rows from the view)
exec dbo.p_search_artists;

-- Test case 2: Text search (artist or band).
-- Find bands in which band member Cassian Reed, Mira Solis, Dante Vale belong. 
-- Input any part of their names to see a list. Note that Dante Vale is in two bands.
exec dbo.p_search_artists @q = N'Cassian';
exec dbo.p_search_artists @q = N'Solis';
exec dbo.p_search_artists @q = N'Vale';

-- Test case 3: Exact band filter, by number
exec dbo.p_search_artists @band_id = 5;
exec dbo.p_search_artists @band_id = 3;
exec dbo.p_search_artists @band_id = 11;

go

-- 5. PROCEDURE p_band_roster_pretty: A list of bands and the members of each band.

create or alter procedure dbo.p_band_roster_pretty
    @band_ids_csv   nvarchar(max) = null,      -- comma separated values e.g. '2,5,9'
    @band_names_csv nvarchar(max) = null,      -- comma separated e.g. 'Queen,Pink Floyd'
    @band_id        int = null,                -- single band id
    @band_name      nvarchar(200) = null       -- single band name
as
begin
    set nocount on;

    declare @target_bands table (band_id int primary key);

    if @band_id is not null
        insert into @target_bands(band_id) VALUES (@band_id);

    if @band_name is not null
        insert into @target_bands(band_id)
        select b.band_id
        from dbo.bands as b
        where dbo.fn_Normalize(b.band_name) = dbo.fn_Normalize(@band_name);

    if @band_ids_csv is not null
        insert into @target_bands(band_id)
        select distinct TRY_CAST(LTRIM(RTRIM(value)) as int)
        from STRING_SPLIT(@band_ids_csv, ',')
        where TRY_CAST(LTRIM(RTRIM(value)) as int) is not null;

    if @band_names_csv is not null
        insert into @target_bands(band_id)
        select distinct b.band_id
        from dbo.bands as b
        join (
            select dbo.fn_Normalize(LTRIM(RTRIM(value))) as name_norm
            from STRING_SPLIT(@band_names_csv, ',')
        ) s on dbo.fn_Normalize(b.band_name) = s.name_norm;

    if not exists (select 1 from @target_bands)
        insert into @target_bands(band_id)
        select b.band_id from dbo.bands as b;

    ;with bands_filtered as (
        select b.band_id, b.band_name
        from dbo.bands as b
        join @target_bands as t on t.band_id = b.band_id
    ),
    member_rows as (
        select
            bf.band_id,
            bf.band_name,
            a.artist_id,
            a.artist_name
        from bands_filtered as bf
        left join dbo.artists as a
          on a.band_id = bf.band_id
    )
    select *
    from (

        select
            bf.band_id,
            bf.band_name,
            cast(null as int)               as artist_id,
            cast(null as nvarchar(200))     as artist_name,
            0                               as row_type,  -- header first
            cast(N'Band: ' + bf.band_name as nvarchar(400)) as line
        from bands_filtered as bf

        union all

        select
            m.band_id,
            m.band_name,
            m.artist_id,
            m.artist_name,
            1 as row_type,
            case
                when m.artist_name is null
                    then cast(N'   - (no members)' as nvarchar(400))
                else cast(N'   - ' + m.artist_name as nvarchar(400))
            end as line
        from member_rows as m
    ) as R
    order by R.band_name, R.row_type, R.artist_name;
end
go

-- TEST Procedure p_band_roster_pretty: Make a table of all selected bands by name, comma-separated

-- Case 1: List members by band name
exec dbo.p_band_roster_pretty @band_names_csv = N'Neon River, Static Horizon, Golden Fractals';

-- Caase 2: List members by band ID
exec dbo.p_band_roster_pretty @band_ids_csv = N'2, 5, 9';


-- Some indexes for better performance when traveling city to city
-- These should help with the common queries artists and tour managers run

-- Index for finding events by date range (tour scheduling)
if exists (select * from sys.indexes where name = 'IX_events_date_time_venue' and object_id = object_id('events'))
    drop index IX_events_date_time_venue on events;

create nonclustered index IX_events_date_time_venue
on events (date_time, venue_id)
include (event_id, event_location, artist, band_id, venue_cost);

-- TEST: IX_events_date_time_venue
select top 3 event_id, date_time, event_location, artist, venue_cost
from events
where date_time >= '2025-08-01' and date_time < '2025-09-01'
order by date_time;

-- Index for finding events by location and date
if exists (select * from sys.indexes where name = 'IX_events_location_date' and object_id = object_id('events'))
    drop index IX_events_location_date on events;

create nonclustered index IX_events_location_date
on events (event_location, date_time)
include (event_id, venue_id, artist, band_id);

-- TEST: IX_events_location_date
select event_id, event_location, date_time, artist
from events
where event_location = 'New York'
order by date_time;

-- Index for finding lodging by event (artists need to know where they're staying)
if exists (select * from sys.indexes where name = 'IX_lodging_event_distance' and object_id = object_id('lodging'))
    drop index IX_lodging_event_distance on lodging;

create nonclustered index IX_lodging_event_distance
on lodging (event_id, distance_from_venue)
include (lodging_id, lodging_name, lodging_address, lodging_city, lodging_state,
         cost_per_night, rating, amenities);

-- TEST: IX_lodging_event_distance
select l.lodging_name, l.lodging_city, l.distance_from_venue, l.cost_per_night, l.rating
from lodging l
where l.event_id = 1
order by l.distance_from_venue;

-- Index for finding restaurants by city and cuisine
if exists (select * from sys.indexes where name = 'IX_restaurants_city_cuisine' and object_id = object_id('restaurants'))
    drop index IX_restaurants_city_cuisine on restaurants;

create nonclustered index IX_restaurants_city_cuisine
on restaurants (restaurant_city, cuisine_type)
include (restaurant_id, restaurant_name, distance_from_venue, food_options,
         open_time, close_time);

-- TEST: IX_restaurants_city_cuisine
select restaurant_name, restaurant_city, cuisine_type, food_options, distance_from_venue
from restaurants
where cuisine_type = 'Mexican'
order by restaurant_city;




--6 Function
-- What is the total lodging cost for each artist for a specified event, considering the number of nights stayed and the cost per night of the lodging?

DROP FUNCTION IF EXISTS dbo.CalculateLodgingCost;
GO

CREATE FUNCTION dbo.CalculateLodgingCost
(
    @CheckInDate DATE,
    @CheckOutDate DATE,
    @CostPerNight DECIMAL(10,2)
)
RETURNS DECIMAL(10,2)
AS
BEGIN
    DECLARE @TotalCost DECIMAL(10,2);
    SET @TotalCost = DATEDIFF(DAY, @CheckInDate, @CheckOutDate) * @CostPerNight;
    RETURN @TotalCost;
END;
GO

SELECT 
    a.artist_name,
    l.lodging_name,
    al.check_in_date,
    al.check_out_date,
    l.cost_per_night,
    dbo.CalculateLodgingCost(al.check_in_date, al.check_out_date, l.cost_per_night) AS total_lodging_cost
FROM 
    dbo.artist_lodging al
    INNER JOIN dbo.artists a ON al.artist_id = a.artist_id
    INNER JOIN dbo.lodging l ON al.lodging_id = l.lodging_id
WHERE 
    al.event_id = 1;


--7 Stored Procedure
--What's the full lineup for a band -- each artist and the instruments they play
--Stored Procedure

USE superfan;
GO

IF OBJECT_ID('dbo.sp_GetBandLineup', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetBandLineup;
GO

CREATE PROCEDURE dbo.sp_GetBandLineup
    @band_id INT
AS
BEGIN
    SET NOCOUNT ON;    
    SELECT 
        a.artist_id,
        a.artist_name,
        STRING_AGG(i.instrument_name, ', ') WITHIN GROUP (ORDER BY i.instrument_name) AS instruments
    FROM dbo.artists AS a
    LEFT JOIN dbo.artist_instruments AS ai
        ON ai.artist_id = a.artist_id
    LEFT JOIN dbo.instruments AS i
        ON i.instrument_id = ai.instrument_id   
    WHERE a.band_id = @band_id
    GROUP BY a.artist_id, a.artist_name
    ORDER BY a.artist_name;
END;
GO


EXEC dbo.sp_GetBandLineup @band_id = 7;


--8 View
--Can we get a one-stop "event Overview" showing each event's date/time, venue location, scheduled band, number of artists in that band, how many restaurants are tied to the event, and cheapest/average lodging cost for that event?
--Event overview view

USE superfan;
GO

IF OBJECT_ID('dbo.v_EventOverview', 'V') IS NOT NULL
    DROP VIEW dbo.v_EventOverview;
GO

CREATE VIEW dbo.v_EventOverview
AS
SELECT 
    e.event_id,
    e.date_time,
    e.event_location,          
    v.venue_city,
    v.venue_state,
    b.band_name,
    (SELECT COUNT(*) 
       FROM dbo.artists a 
      WHERE a.band_id = e.band_id) AS artist_count,
    (SELECT COUNT(*) 
       FROM dbo.restaurants r 
      WHERE r.event_id = e.event_id) AS restaurants_nearby,
    (SELECT MIN(l.cost_per_night) 
       FROM dbo.lodging l 
      WHERE l.event_id = e.event_id) AS min_lodging_cost_per_night,
    (SELECT AVG(CAST(l.cost_per_night AS DECIMAL(18,2))) 
       FROM dbo.lodging l 
      WHERE l.event_id = e.event_id) AS avg_lodging_cost_per_night
FROM dbo.events  AS e
LEFT JOIN dbo.bands  AS b ON b.band_id  = e.band_id
LEFT JOIN dbo.venues AS v ON v.venue_id = e.venue_id;
GO


SELECT *
FROM dbo.v_EventOverview
ORDER BY date_time;

SELECT *
FROM dbo.v_EventOverview
WHERE venue_city = 'Austin'
  AND (min_lodging_cost_per_night IS NOT NULL AND min_lodging_cost_per_night <= 120)
ORDER BY date_time;
