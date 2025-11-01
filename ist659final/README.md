# Superfan: An SQL Database for Concert Tour Management

By [Dan Pacheco](https://danpacheco.com) and two other students (names omitted in this public version).  
Final Project for IST 659: Database Administration Concepts and Database Management  
Syracuse University iSchool  
September 12, 2025

**Download the full paper:** [PDF version](https://github.com/pachecod/pachecod.github.io/blob/master/ist659final/Superfan_paper_v7_anonymized.pdf)

**Sections:** [Introduction](#introduction) | [Database Design](#database-design) | [Key Tables](#key-tables) | [Functions & Views](#functions-and-views) | [Use Cases](#use-cases) | [Sample UI](#sample-ui) | [Lessons Learned](#lessons-learned)

---

## Introduction

When you think about concerts, it's tempting to think that it's a piece of cake. A band pulls up in its tour bus, unpacks instruments, gets on the stage to play, and then packs up for the next gig. But the reality is that it is a **logistical nightmare** for everyone involved.

Artists may belong to more than one band, or open for a band while also traveling for their own tours. They may have different artists and backup singers performing on different dates. And in many cases, there is no tour bus. Artists travel on their own flights from city to city, often on different dates, stay at different hotels, and find themselves with just an hour to eat dinner very late (if at all) after performing a show.

The concert staff members have multiple skillsets that require them to arrive and leave at different times. They also have their own travel arrangements and hotel schedules. Sometimes, the stagehands aren't even on staff – they are freelancers who operate in a single city and set up and take down stages for different acts.

Finally, there are the tour managers who serve as the unlucky hub for this information as well as having to set up the travel folios for all of these disparate parties. Much of the information is handled with hastily-composed, disorganized emails and PDFs that leave everyone frustrated and confused.

All of this chaos is the perfect use for a SQL database that we call **"Superfan."** Ironically, Superfan doesn't do anything directly for fans, but it ensures that the concerts they attend happen on time and with the right people in place for every show. And hopefully it also maintains the sanity of the tour manager who is at the center of it all.

## Who This Serves

The Superfan database is set up to serve three broad categories of stakeholders:

1. **Tour Managers:** People who assemble and manage all the logistics of a tour for a traveling band and support staff.
2. **Artists and Bands:** Musicians and the bands in which they play. Artists can belong to more than one band.
3. **Concert Staff:** The people who create sets, take them down, run the lights, sound engineers, and so forth.

## Database Design

The central entity is the **Event**, which is made of details like date and time, location, ticket price, artists, bands, and a description of the event. Everything else radiates out from there.

The **Venue** represents the physical locations where events take place and is made up of address, capacity limits, amenities, and security rules. Venues can host multiple events over time, establishing a one-to-many relationship.

The system also tracks **restaurants** near venues through the Restaurant table. This includes cuisine types, operating hours, distance from venue, and pricing information. (Because everyone needs to eat, right?)

**Parking Lot** information helps manage venue accessibility by tracking parking addresses and capacity.

The **Lodging** system manages accommodation needs of everyone involved with a concert. It includes lodging types, costs, amenities, and ratings.

Finally, there are **Artist** and **Band** tables. There's a many-to-many relationship between artists and instruments through the ArtistInstrument junction table, allowing the system to track which musicians play which instruments. This was really important because some artists are multi-instrumentalists, and we needed to capture that complexity.

## Key Tables

### Artists & Bands

The Artists table links individual artists to bands, supports solo artists (with NULL band_id), and enforces unique artist names. We populated it with 20 futuristic-sounding artists like "Aria Vega," "Zephyr Cain," and "Mira Solis."

The Bands table is the central registry of musical groups in the system. We created 20 sample bands including "The Midnight Owls," "Crimson Echoes," "Neon River," and "Crystal Pines."

### Instruments

We had some fun here! Instead of boring old "guitar" and "drums," we created futuristic instruments including "Synth Harp," "Solar Drums," "Crystal Guitar," "Echo Flute," and "Bass Engine." (I mean, if you're going to build a database from scratch, why not make it interesting?)

The artist_instruments junction table implements the many-to-many relationship supporting multi-instrumentalist artists.

### Venues

This table handles comprehensive venue management with capacity (ranging from 7,545 to 45,833), location, environment types (Indoor, Outdoor, Mixed), security requirements, and contraband restrictions. Because apparently some venues need to ban "Drugs, Pets" while others restrict "Weapons, Alcohol."

### Events

The Events table is where it all comes together – scheduled performances with venue and cost tracking. We created sample tour dates from March 2025 through September 2025, with venue costs ranging from $49 to $200.

### Lodging & Restaurants

These tables were crucial for the real-world application. The Lodging table includes accommodation costs ($120.50-$150.00 per night), distance from venues (0.9-2.8 miles), amenities ("WiFi,Pool,Gym"), and quality ratings (3.8-4.5 stars).

The Restaurants table manages dining options with cuisine types (Diner, BBQ, Italian, Mexican), dietary options (Vegetarian, Vegan, Gluten-Free), operating hours, and venue proximity. Because a hangry musician is not a good musician.

## Functions and Views

### 1. Band Artist Lookup Function
This function lets you dynamically query band rosters for tour planning and coordination. Just give it a band_id and it returns all the artists in that band.

```sql
SELECT * FROM dbo.fn_BandArtists(3);
```

### 2. Artist-Instrument Capability View
Shows a detailed roster of artists in bands with their specific instruments for technical setup planning. This is super useful when you're setting up a venue and need to know exactly what equipment to have ready.

### 3. Artist Search Stored Procedure
This was one of my favorite features to build. It provides flexible search functionality supporting partial text matching, exact band filtering, and normalized string comparison. You can search by artist name, band name, or browse all artists.

```sql
EXEC dbo.p_search_artists @q = N'Solis';
```

### 4. Advanced Band Roster Procedure
This procedure creates formatted, human-readable band rosters for tour documentation and coordination meetings. It accepts multiple input methods (single ID, single name, CSV lists) and produces formatted output with band headers.

### 5. Event Overview View
This was the big one – a comprehensive event planning dashboard showing venue details, band info, restaurant count, and lodging cost analysis for budget planning. Everything a tour manager needs in one place.

## Performance Optimization

We created several indexes for better performance when traveling city to city:

- **Event Date Range Index:** Optimized queries for tour schedule planning and monthly event coordination
- **Location-Based Event Index:** For city-specific event planning when coordinating multiple shows in the same area
- **Lodging Distance Index:** Find closest accommodations to venues for minimizing travel time and transportation costs
- **Restaurant Cuisine Index:** Coordinate dining options by cuisine preferences and dietary requirements

## Use Cases and Queries

Here are some of the practical questions our database can answer:

**For Artists:**
- What's the full schedule of upcoming performances for a given artist/band?
- Which hotel is assigned to each band/artist for a given event?
- What restaurants are available near venues, and do they cover dietary needs?

**For Tour Managers:**
- What's the average lodging cost per night for an event?
- Which staff members are assigned to which bands?
- Are there enough hotel rooms assigned for all staff and artists at an event?

**For Staff:**
- Which artists are scheduled to perform in the next week/month?
- What instruments need to be set up for each event?
- What's happening on a particular date?

We wrote SQL queries for all of these scenarios, and they work beautifully!

## Sample User Interface

Even though this was a database class and UI wasn't required, we couldn't resist mocking up what a real application might look like. We created four different dashboard views:

1. **Tour Manager View:** Large dashboard with all events, budget tracking, and analytics
2. **Budget View:** Detailed lodging cost breakdown with remaining budget visualization
3. **Staff View:** Band lineup with instrument setup checklist for venue preparation
4. **Artist View:** Daily schedule with check-in/check-out times, hotel amenities, venue details, and nearby restaurants

The mockups use a clean orange and white color scheme with intuitive navigation. I think they look pretty professional, if I do say so myself!

## Lessons Learned

### On Merging SQL Scripts (from team member 1)
The biggest lesson? When you're troubleshooting SQL errors, **start from the top, not the bottom**. SQL runs from top to bottom, so fixing the first error often solves all the subsequent ones. Looking back, it's obvious, but in the moment it wasn't!

### On Collaboration (from team member 2)
Coming from a design background, this felt unusual. I spent much more time conceptually thinking about data and table relationships than visualizing the user experience. Creating mockups was the *last* thing I did, when normally UI concepts are something I do very early on to imagine user needs.

### On Team Coordination (from me)
The biggest lesson for me has been how challenging it is to have multiple people working on what in the end needs to be a single SQL script because of all the dependencies in the code. If you forget to drop a table or view or really anything higher up, the entire script breaks. We ended up having one team member "true up" the final up/down script and make it transaction safe, and then we each worked on our views and functions independently. In the working world I imagine there are better environments and best practices for handling this, but we had to figure it out on our own.

## Conclusion

Superfan does a great job at handling most of the logistical challenges in concert tour management. We think it's so good that we wonder if this is something that exists in the marketplace yet. If not, maybe someone could make a business out of it. It could be almost like QuickBooks, but for concert managers.

By centralizing all of the information around artists, venues, hotels, food and even musical instruments and roles into one database, it provides a birds-eye view of all of those relationships and constraints. Its real power is that one person (tour manager) inputs information, but everyone at every level can benefit by seeing the information they need to know at that particular time.

---

**Note:** The full SQL code for this project includes the complete up/down script for creating the database, as well as a separate queries script with all the functions, views, stored procedures, and indexes described above. The database contains over 10 interconnected tables with proper foreign key relationships and constraints to ensure data integrity.
