/* =====================================================================
   RDR2 CIGARETTE CARDS — DATA ONLY (no rendering logic here)
   ---------------------------------------------------------------------
   CONFIGURATION
   • ASSET PATHS ........ CONFIG.paths  (folder per image type)
   • FILE EXTENSION ..... CONFIG.ext
   • FILENAME OVERRIDES . CONFIG.fileOverrides — if a real JPG filename
     differs from the generated slug, add   "card-id": "real-filename"
     (no extension). Gallery logic does not need to change.
   • GOOGLE FORM ........ CONFIG.googleFormUrl / CONFIG.googleFormEmbedUrl

   Default file name pattern (also the download name):
     [set-slug]-[card-no]-[card-name-slug].jpg
     e.g. images/fronts/famous-gunslingers/famous-gunslingers-05-flaco-hernandez.jpg
   ===================================================================== */
(function (root) {
  "use strict";

  var CONFIG = {
    // ---- ASSET PATHS (relative to index.html) -------------------------
    paths: {
      thumbnails: "images/thumbnails",
      fronts: "images/fronts",
      backs: "images/backs",
      originals: "images/originals"
    },
    ext: ".jpg",
    // Optional extra thumbnail widths for srcset, e.g. [320, 640].
    // Expected files: images/thumbnails/[set]/[slug]-320w.jpg ...
    // Leave empty if you only have one thumbnail size.
    thumbWidths: [],
    // SHARED BACKS: if every card in a set has the SAME back picture, list it here
    // (set slug -> path) and you only need that ONE file instead of 12 copies.
    // Sets not listed here use one back per card as usual.
    sharedBacks: {
      "fauna-of-america": "images/backs/fauna-of-america/back.jpg",
      "famous-gunslingers": "images/backs/famous-gunslingers/back.jpg"
    },
    // Map a card id to the real filename (without extension) if it differs.
    fileOverrides: {
      // "famous-gunslingers-05-flaco-hernandez": "FlacoHernandez"
    },
    // Intrinsic dimensions used for width/height attributes + aspect ratio.
    // Change to match your real thumbnails (ratio only matters).
    dims: {
      vertical: { w: 400, h: 600 },
      horizontal: { w: 600, h: 400 }
    },

    // ---- PRINTED SET ENQUIRY (Google Form) ----------------------------
    // Paste your Google Form "Send > link" URL here:
    googleFormUrl: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform",
    // Optional: paste the "Embed HTML" src URL (ends in ?embedded=true) to
    // show the form inline. Leave "" to show only the button.
    googleFormEmbedUrl: ""
  };

  var SETS = [
    {
      name: "Prominent Americans", slug: "prominent-americans", orientation: "vertical",
      cards: [
        ["President Fisher", "North of Rhodes", "Beside barrels north of Jansen Mills near Southfield Flats."],
        ["President Hardin", "West of Lagras", "Between Lagras and the Kamassa River, near the jetty."],
        ["Lillian Powell", "Lemoyne", "Near bushes beside the shack north of the O in LEMOYNE."],
        ["Leviticus Cornwall", "Southwest of Valentine", "On the porch of the farmhouse between the I and N in VALENTINE."],
        ["J.D. McKnight", "Rhodes", "On a table inside the gazebo in the southernmost part of town."],
        ["Luther Covington", "Saint Denis docks", "On a crate at the southwestern docks."],
        ["Harvey Griggs", "South Saint Denis", "On a bench inside the building near the railway tracks and docks."],
        ["Henrietta Beatrice Woods", "Bayou Nwa", "Near the red house north of Saint Denis, southwest of the second A in BAYOU NWA."],
        ["General Quincy Harris", "Heartland Oil Fields", "At the bottom of the tower northeast of the station marker."],
        ["General Cornelius Palmer", "North of Rhodes", "Inside a shed near the houses north of Mattock Pond."],
        ["Senator Thaddeus Waxman", "Lemoyne", "Inside the house north of the O in LEMOYNE."],
        ["President Alfred MacAlister", "Islands southwest of Saint Denis", "On a southeastern windowsill on an island in the southernmost group."]
      ]
    },
    {
      name: "The World’s Champions", slug: "worlds-champions", orientation: "vertical",
      cards: [
        ["Percy Wood", "New Hanover", "Beside the well south of the R in NEW HANOVER."],
        ["Edwin A. Rowe", "North of Valentine", "Inside the building across the Dakota River and beyond the railway tracks."],
        ["Theobald Getzin", "Emerald Ranch", "Outside the building east of the main road into the ranch."],
        ["H.T. Slocum", "Bluewater Marsh", "On a box inside the shack at the H in MARSH."],
        ["R.S. Harradon", "Bluewater Marsh", "Outside the house across the river from the H.T. Slocum shack."],
        ["E.D. Ewing", "Dewberry Creek", "On a basement shelf in the house near the New Hanover border; enter through the floor hatch."],
        ["Patsey Hill", "Saint Denis", "Inside the house north of the saloon on the river’s eastern side."],
        ["William Sleicher", "Near Heartland Oil Fields", "On a table inside the house in the southern part of the small settlement."],
        ["Edwin Singerly", "Annesburg", "At the top of the tower in western Annesburg."],
        ["Felix Hawley", "Barrow Lagoon", "On a table inside the only cabin beside the lagoon."],
        ["Capt. Jack Page", "Grizzlies West", "Inside the small house near the railway north of the V in VALENTINE."],
        ["Axel McCormack", "Saint Denis", "On a crate behind the saloon."]
      ]
    },
    {
      name: "Famous Gunslingers", slug: "famous-gunslingers", orientation: "vertical",
      cards: [
        ["Frank Heck", "Valentine cemetery", "Beside the eastern headstone in Valentine cemetery."],
        ["Otis Miller Boys", "Cumberland Forest", "At the back of a wagon near the U in CUMBERLAND, southwest of Fort Wallace."],
        ["Jack Hall Gang", "Chez Porter", "On the windowsill inside the western shack at Chez Porter."],
        ["Butcher Brothers", "Butcher Creek", "On a barrel on the porch of the southeastern cabin."],
        ["Flaco Hernandez", "Rhodes", "On the northwest ledge of the Rhodes bank roof."],
        ["Slim Grant", "Fairvale Shanty", "On a barrel beside the shack north of Grizzlies East."],
        ["Landon Ricketts", "Armadillo", "On a barrel behind the house opposite the undertaker."],
        ["Black Belle", "Blackwater docks", "On a barrel at the eastern side of the riverboat company dock."],
        ["Billy Midnight", "Tumbleweed", "At the top of the eastern windmill."],
        ["Emmet Granger", "Canebreak Manor", "On a table inside Canebreak Manor in Bluewater Marsh."],
        ["Jim “Boy” Calloway", "Saint Denis cemetery", "Inside the northwestern mausoleum."],
        ["Bart Love", "Hanging Dog Ranch", "On a couch inside the main house near Little Creek River."]
      ]
    },
    {
      name: "Artists, Writers, Painters & Poets", slug: "artists-writers-painters-poets", orientation: "vertical",
      cards: [
        ["Edith Corinne", "Braithwaite Manor", "Near the clothesline behind Braithwaite Manor."],
        ["Elsie Rose", "Strawberry", "On a table near the stairs on the hotel’s second floor."],
        ["W.G. Hoyt", "New Hanover", "On a table in the cabin beside a small lake above the N and O in NEW HANOVER."],
        ["Aldous Bramley", "South of Blackwater", "Between two chairs on the porch of a house just outside Blackwater."],
        ["Preston T. Stephenson", "Annesburg", "On a desk inside the supply office in central Annesburg."],
        ["Evelyn Miller", "Blackwater", "On a table behind a house above the E in BLACKWATER."],
        ["Slick Hutton", "Van Horn Mansion", "On the northeast balcony of the mansion south of Van Horn."],
        ["Laurence Carson", "Saint Denis", "On a table in the market alley beneath the S in SAINT DENIS."],
        ["Miss Maud Delancey", "Bluewater Marsh", "On a table inside the houseboat near the W in BLUEWATER."],
        ["Charles Châtenay", "North of Valentine", "On the porch table at Mary Linton’s house."],
        ["George Dixie", "New Hanover", "On a bed inside the house below the A in NEW HANOVER."],
        ["Richard McCullough", "North of Saint Denis", "On a table beside the gazebo north of Saint Denis."]
      ]
    },
    {
      name: "Vistas of America", slug: "vistas-of-america", orientation: "vertical",
      cards: [
        ["New York", "Caliga Hall", "Outside a house in the southern part of Caliga Hall."],
        ["Saint Denis", "Saint Denis", "On a cart beside the railway tracks in the southeastern city."],
        ["Blackwater", "Blackwater", "On the theatre roof near the chimney."],
        ["Armadillo", "Armadillo", "On a barrel inside the pig pen west of town."],
        ["Rio Bravo", "Flatneck Station", "On the windmill."],
        ["The Grizzlies", "Lake Don Julio", "Inside the shack north of the lake, south of Armadillo."],
        ["San Francisco", "Fort west of Van Horn", "Inside the southeastern tower of the fort."],
        ["Tall Trees", "Flatneck Station", "On a barrel in the southern part of the station."],
        ["Valentine", "Valentine Station", "On a table inside the railway station."],
        ["Chicago", "Emerald Ranch", "On the southern windmill."],
        ["Rhodes", "Rhodes cemetery", "On a grave in the cemetery."],
        ["Annesburg", "Annesburg", "On a barrel beside the mine-cart tracks in western Annesburg."]
      ]
    },
    {
      name: "Gems of Beauty", slug: "gems-of-beauty", orientation: "vertical",
      cards: [
        ["Leila Stetson", "Cumberland Forest border", "Inside the house beyond the railway track northeast of Heartland Oil Fields, near the fireplace."],
        ["Isabelle Barlow", "North of Annesburg", "Inside the abandoned post office beside the tracks above Roanoke Valley."],
        ["Hattie Langtry", "Roanoke Valley", "On a table inside a hut north of Annesburg."],
        ["Isabelle Standish", "Annesburg mine", "On a table in the large open area reached via the southern mine shaft."],
        ["Maud Engel", "Heartland Oil Fields", "On a table inside the southern shack."],
        ["Sadie Russell", "South of Blackwater", "On a barrel inside the chicken coop."],
        ["Geraldine Emerson", "Little Creek River", "On a crate on the second floor of a barn north of the river."],
        ["Agnes Guyon", "Grizzlies West", "On a box inside the shack above the E in GRIZZLIES."],
        ["Jennie Willetts", "Van Horn", "On a barrel opposite the post office."],
        ["Ilga Ulmer", "Saint Denis", "On a table in the alley between the E and N in SAINT DENIS."],
        ["Fay Delaro", "Valentine", "Near the window on the second floor of the barn south of town."],
        ["Pauline Henderson", "Bacchus Station", "On a crate inside the station."]
      ]
    },
    {
      name: "Wild Flora of America", slug: "wild-flora-of-america", orientation: "vertical",
      cards: [
        ["Golden Currant", "Lakay", "On a shelf inside the northeastern shack near Lakay."],
        ["Hummingbird Sage", "Road to Van Horn", "On a table inside the shack near the R in HANOVER."],
        ["Oleander Sage", "Saint Denis", "Behind vines above the E in the city name."],
        ["Yarrow", "South of Lakay", "On a windowsill in the cabin."],
        ["Indian Tobacco", "South of Lakay", "On a crate beside the cabin."],
        ["Black Mangrove", "Emerald Station", "Under a bench at the station."],
        ["Longleaf Pine", "Annesburg mine", "On a box southwest of the first ladder inside the mine west of town."],
        ["Desert Fan Palm", "Tumbleweed", "On the porch of the house above the T in TUMBLEWEED."],
        ["Coastal Redwood", "South of Strawberry", "On the back porch of the house."],
        ["Horse Crippler Cactus", "Caliga Hall", "On a table beside the Kamassa River."],
        ["Blazing Star", "Northern West Elizabeth", "Near the front door of the cabin above the W in WEST ELIZABETH."],
        ["Carolina Lupine", "Tumbleweed", "On the roof of the sheriff’s office."]
      ]
    },
    {
      name: "Fauna of America", slug: "fauna-of-america", orientation: "horizontal",
      cards: [
        ["Black Widow Spider", "West Elizabeth", "Inside a cabin on the main road near the W in WEST ELIZABETH."],
        ["Bloodhound", "North of Bolger Glade", "Inside the ruined house, beside the fireplace."],
        ["Bluejay", "West of Van Horn", "On the tree platform reached by ladder, southwest of Elysian Pool."],
        ["Catfish", "Saint Denis docks", "On a barrel at the western docks."],
        ["Coral Snake", "Lakay", "On a table inside the large house."],
        ["Grouper", "West of Lagras", "On a barrel beside a boat on the Kamassa River."],
        ["Large Mouth Bass", "New Hanover–Lemoyne border", "Under the couch inside the cabin near the regional border."],
        ["Panther", "Fort Brennand", "On a crate inside a tent at the fort southwest of Van Horn."],
        ["Parrot", "Kamassa River, Lemoyne", "On the pier near the Y in LEMOYNE."],
        ["Pheasant", "West of Van Horn", "On the same tree platform as the Bluejay card."],
        ["Snapping Turtle", "South of Cumberland Forest", "Inside the house near the dresser."],
        ["Turkey", "Van Horn Trading Post", "On the second floor of the sheriff’s office."]
      ]
    },
    {
      name: "Stars of the Stage", slug: "stars-of-the-stage", orientation: "vertical",
      cards: [
        ["Laurence Dunn", "Southfield Flats", "Inside the house north of Rhodes."],
        ["Louis Durand", "West of Van Horn", "Beside the ruined house."],
        ["Jesse Raymond", "North of Tumbleweed", "On a windowsill inside the house."],
        ["Augusta Tremlow", "Little Creek River", "On the windmill north of the word LITTLE on the map."],
        ["Mabel Potter", "Saint Denis theatre", "On a table beside the fireplace in the western theatre."],
        ["Robin Koninsky", "Saint Denis theatre", "After “Fatherhood and Other Dreams”, watch every theatre performance; then collect it from the table beside the stage."],
        ["Isadore Reid", "Valentine", "On a wagon west of town."],
        ["Irene Grubb", "Southwest of MacFarlane’s Ranch", "On a bench at the railway station."],
        ["Nettie Palmer", "Valentine", "Beside the projector inside the show tent."],
        ["Jim Cobb", "Lemoyne", "Inside the ruined house east of the first E in LEMOYNE."],
        ["Mittie Comstock", "New Hanover", "Near the house south of the H in NEW HANOVER."],
        ["Robert Elliot Patchen", "Mattock Pond", "Beside the hut south of Mattock Pond."]
      ]
    },
    {
      name: "Marvels of Travel", slug: "marvels-of-travel", orientation: "horizontal",
      cards: [
        ["Packet Ship", "Annesburg docks", "At the northeastern end of the docks."],
        ["Schooner", "Van Horn pier", "Under a hammock on the boat at the pier."],
        ["Camel Caravan", "South of Rhodes", "On a table beside a clothesline."],
        ["Elephant Carriage", "Strawberry", "Behind the hotel in the northeastern part of town."],
        ["Goat Carriage", "Emerald Ranch", "On a workbench in the western stable."],
        ["Hot Air Balloon", "Saint Denis", "On a shelf in the northeastern saloon."],
        ["U.S. Frigate", "West of Braithwaite Manor", "On the boathouse."],
        ["The Showboat", "Saint Denis", "On the southernmost pier."],
        ["Balener Whaling Vessel", "Saint Denis docks", "On a windowsill of the small building at the southeastern docks."],
        ["Stagecoach", "Riggs Station", "On a bench at the station."],
        ["Steam Locomotive", "Flat Iron Lake", "Beside a wall in the ruined settlement on the lake’s eastern side."],
        ["Velocipede", "Saint Denis", "Beside the house east of the second E in LEMOYNE."]
      ]
    },
    {
      name: "Amazing Inventions", slug: "amazing-inventions", orientation: "horizontal",
      cards: [
        ["Camera", "Saint Denis", "Inside the building immediately south of the photo studio."],
        ["Cylinder Phonograph", "Valentine", "Inside Keane’s Saloon."],
        ["Dynamite", "Shady Belle", "Inside Shady Belle, south of Caliga Hall and southwest of Saint Denis."],
        ["Electrical Execution Apparatus", "West Elizabeth", "Second floor of the house north of Little Creek River, north of the second E in WEST ELIZABETH."],
        ["Electric Light Bulb", "Brandywine Drop", "Beside the back door of a building northwest of Brandywine Drop."],
        ["Fountain Pen", "Lemoyne", "Inside the abandoned school northeast of the O in LEMOYNE."],
        ["Manned Glider", "Caliga Hall", "Inside the barn west of Caliga Hall."],
        ["Player Piano", "Saint Denis", "On top of a piano inside a building west of the D in SAINT DENIS."],
        ["Revolver", "Annesburg", "In the basement of the Annesburg gunsmith."],
        ["Steam Locomotive", "Bolger Glade", "On the second floor of the ruined church east of Bolger Glade."],
        ["Telegraph", "Van Horn Trading Post", "On the abandoned railway platform northwest of Van Horn."],
        ["Typewriter", "West Elizabeth", "Beside the warehouse door near the second T in WEST ELIZABETH."]
      ]
    },
    {
      name: "Horses", slug: "horses", orientation: "horizontal",
      cards: [
        ["American Paint", "East of Rhodes", "Inside the cotton mill east of Rhodes."],
        ["Appaloosa", "Saint Denis docks", "On a barrel behind the large building at the southern docks."],
        ["Andalusian", "Painted Sky", "On a shelf at the rear of the stable at Painted Sky, south of Valentine."],
        ["American Standardbred", "South of Braithwaite Manor", "In a bedroom of the waterfront house south of Braithwaite Manor."],
        ["Nokota", "Rhodes", "Inside a stable in the southern part of Rhodes."],
        ["Ardennes", "Wallace Station", "On a shelf inside Wallace Station."],
        ["Dutch Warmblood", "Downes Ranch", "On the mantel inside the ranch house."],
        ["Turkoman", "O’Creagh’s Run", "On a workbench inside the cabin near O’Creagh’s Run."],
        ["Hungarian Half-bred", "Armadillo", "Inside a hole in the door of the blacksmith shop."],
        ["Mustang", "Downes Ranch", "On top of hay inside the barn."],
        ["Thoroughbred", "Rhodes", "On the wagon nearest the cotton in the centre of Rhodes."],
        ["Missouri Fox Trotter", "Lannahechee River", "In a bedroom of the house beside the river south of Braithwaite Manor."]
      ]
    }
  ];

  // ---- helpers (data building only) -----------------------------------
  function slugify(s) {
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[’'“”"]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  // ---- build the single flat 144-record list --------------------------
  var CARDS = [];
  SETS.forEach(function (set, si) {
    set.number = si + 1;
    set.cards.forEach(function (row, i) {
      var id = set.slug + "-" + pad(i + 1) + "-" + slugify(row[0]);
      var file = (CONFIG.fileOverrides[id] || id) + CONFIG.ext;
      var dir = "/" + set.slug + "/";
      var thumb = CONFIG.paths.thumbnails + dir + file;
      var srcset = CONFIG.thumbWidths.length
        ? CONFIG.thumbWidths.map(function (w) {
            return CONFIG.paths.thumbnails + dir + file.replace(CONFIG.ext, "-" + w + "w" + CONFIG.ext) + " " + w + "w";
          }).join(", ")
        : "";
      CARDS.push({
        id: id,
        slug: id,                       // also used as the download filename
        setName: set.name,
        setSlug: set.slug,
        setNumber: si + 1,
        cardNumber: i + 1,
        name: row[0],
        orientation: set.orientation,
        thumb: thumb,
        thumbSrcset: srcset,
        front: CONFIG.paths.fronts + dir + file,
        back: CONFIG.sharedBacks[set.slug] || (CONFIG.paths.backs + dir + file),
        original: CONFIG.paths.originals + dir + file,
        region: row[1],
        pickup: row[2]
      });
    });
  });

  root.RDR2_DATA = { config: CONFIG, sets: SETS, cards: CARDS, slugify: slugify };
})(typeof window !== "undefined" ? window : globalThis);