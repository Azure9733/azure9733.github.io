// Map Styles with Labels
const createStyle = (color, strokeColor, strokeWidth = 2) => {
    return new ol.style.Style({
        fill: new ol.style.Fill({
            color: color
        }),
        stroke: new ol.style.Stroke({
            color: strokeColor,
            width: strokeWidth
        }),
        text: new ol.style.Text({
            font: '14px "Open Sans", "Arial Unicode MS", sans-serif',
            fill: new ol.style.Fill({ color: '#000' }),
            stroke: new ol.style.Stroke({
                color: '#fff',
                width: 4
            }),
            overflow: true,
            offsetY: -15,
            padding: [5, 5, 5, 5],

            textAlign: 'center',
            textBaseline: 'middle'
        })
    });
};

// Define styles with fixed widths
const styles = {
    academic: createStyle('rgba(0, 0, 255, 0.2)', 'rgba(0, 0, 255, 1)'),
    grass: createStyle('rgba(0, 255, 0, 0.2)', 'rgba(0, 255, 0, 1)'),
    hostel: createStyle('rgba(255, 165, 0, 0.2)', 'rgba(255, 165, 0, 1)'),
    mess: createStyle('rgba(255, 0, 0, 0.2)', 'rgba(255, 0, 0, 1)'),
    parking: createStyle('rgba(128, 128, 128, 0.2)', 'rgba(128, 128, 128, 1)'),
    sports: createStyle('rgba(147, 112, 219, 0.2)', 'rgba(147, 112, 219, 1)'),
    shops: createStyle('rgba(255, 140, 0, 0.2)', 'rgba(255, 140, 0, 1)'),
    temple: createStyle('rgba(139, 69, 19, 0.2)', 'rgba(139, 69, 19, 1)'),
    walkways: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#8B4513',
            width: 2
        }),
        text: new ol.style.Text({
            font: '14px "Open Sans", "Arial Unicode MS", sans-serif',
            fill: new ol.style.Fill({ color: '#000' }),
            stroke: new ol.style.Stroke({
                color: '#fff',
                width: 4
            }),
            overflow: true,
            offsetY: -10,
            padding: [5, 5, 5, 5],
            textAlign: 'center',
            textBaseline: 'middle',
            placement: 'line'
        })
    }),
    circles: createStyle('rgba(169, 169, 169, 0.2)', 'rgba(169, 169, 169, 1)'),
    roads_main: new ol.style.Style
    ({
        stroke: new ol.style.Stroke({
            color: '#333333',
            width: 3,
            lineCap: 'round',
            lineJoin: 'round'
        }),
        text: new ol.style.Text({
            font: '14px "Open Sans", "Arial Unicode MS", sans-serif',
            fill: new ol.style.Fill({ color: '#000' }),
            stroke: new ol.style.Stroke({
                color: '#fff',
                width: 4
            }),
            overflow: true,
            offsetY: -10,
            padding: [5, 5, 5, 5],
            textAlign: 'center',
            textBaseline: 'middle',
            placement: 'line'
        })
    }),
    roads_second: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#666666',
            width: 2,
            lineCap: 'round',
            lineJoin: 'round'
        }),

    }),
    under_construction: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 0, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#FFD700',
            width: 2,
            lineDash: [10, 10]
        }),
        text: new ol.style.Text({
            font: '14px "Open Sans", "Arial Unicode MS", sans-serif',
            fill: new ol.style.Fill({ color: '#000' }),
            stroke: new ol.style.Stroke({
                color: '#fff',
                width: 4
            }),
            overflow: true,
            offsetY: -10,
            padding: [5, 5, 5, 5],
            textAlign: 'center',
            textBaseline: 'middle'
        })
    }),
    tree: new ol.style.Style({
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({
                color: 'rgba(34, 139, 34, 0.8)'
            })
        })
    })
};

// Function to create style with label
function createLabeledStyle(feature, baseStyle) {
    const shops = feature.get('Shops');
    const sports = feature.get('Sports');
    const nameNum = feature.get('Name/Num');
    const name = feature.get('Name');

    const style = baseStyle.clone();
    
    // Create text style if it doesn't exist
    let text = style.getText();
    if (!text) {
        text = new ol.style.Text({
            font: '14px "Open Sans", "Arial Unicode MS", sans-serif',
            textAlign: 'center',
            textBaseline: 'middle'
        });
        style.setText(text);
    }
    
    // Prioritize Shops and Sports properties, then Name/Num
    if (shops) {
        text.setText(shops);
    } else if (sports) {
        text.setText(sports);
    } else if (nameNum) {
        text.setText(nameNum);
    } else if (name) {
        text.setText(name);

    } else {
        return baseStyle;
    }
    
    // Preserve line placement for roads, use point placement for others
    const featureType = feature.get('type') || '';
    if (!featureType.includes('road') && !featureType.includes('walkway')) {
        text.setPlacement('point');
    }
    text.setOverflow(true);
    
    return style;
}

// Initialize Map with Scale Bar
const map = new ol.Map({
    target: 'map',
    layers: [],
    view: new ol.View({
        center: [0, 0],
        zoom: 17,
        minZoom: 16,
        maxZoom: 19,
        constrainRotation: false // Allow map rotation
    }),
    controls: [
        new ol.control.ScaleLine({
            units: 'metric' // Use meters/kilometers
        })
    ]
});

// Load events data
let eventsData = [];
fetch('data/revels_events.json')
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            eventsData = data.data;
        }
    })
    .catch(error => console.error('Error loading events:', error));

// Vector Sources Array and Layers Object
const vectorSources = [];
const layers = {};

// Add GeoJSON Layer Function
function addGeoJSONLayer(url, style, id) {
    const vectorSource = new ol.source.Vector({
        url: url,
        format: new ol.format.GeoJSON()
    });

    vectorSources.push(vectorSource);

    const vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: function(feature) {
            return createLabeledStyle(feature, style);
        },
        declutter: true
    });

    layers[id] = vectorLayer;
    map.addLayer(vectorLayer);
    
    // Add event listener for the corresponding checkbox
    const checkbox = document.getElementById(`${id}-toggle`);
    if (checkbox) {
        checkbox.addEventListener('change', function() {
            vectorLayer.setVisible(this.checked);
        });
    }
    
    return vectorLayer;
}

// Add Layers
const layerConfigs = {
    academic: { url: 'data/Academic_Blocks.geojson', style: styles.academic },
    grass: { url: 'data/Grasscover.geojson', style: styles.grass },
    hostel: { url: 'data/Hostels.geojson', style: styles.hostel },
    mess: { url: 'data/Mess.geojson', style: styles.mess },
    parking: { url: 'data/Parking.geojson', style: styles.parking },
    sports: { url: 'data/Sports.geojson', style: styles.sports },
    shops: { url: 'data/Shops.geojson', style: styles.shops },
    temple: { url: 'data/temple.geojson', style: styles.temple },
    tree: { url: 'data/Trees.geojson', style: styles.tree },
    walkways: { url: 'data/walkways.geojson', style: styles.walkways },
    circles: { url: 'data/circles.geojson', style: styles.circles },
    roads_main: { url: 'data/roads_main.geojson', style: styles.roads_main },
    roads_second: { url: 'data/roads_second.geojson', style: styles.roads_second },
    under_construction: { url: 'data/Under_Construction.geojson', style: styles.under_construction }
};

// Initialize layers
Object.entries(layerConfigs).forEach(([id, config]) => {
    addGeoJSONLayer(config.url, config.style, id);
});

// Add location pointer for "MIT Ground"
const sportsSource = layers.sports.getSource();
sportsSource.once('change', function() {
    if (sportsSource.getState() === 'ready') {
        const mitGround = sportsSource.getFeatures().find(feature => 
            feature.get('Sports') === 'MIT Ground'
        );
        if (mitGround) {
            const geometry = mitGround.getGeometry();
            const centroid = ol.extent.getCenter(geometry.getExtent());

            const pointer = new ol.Feature({
                geometry: new ol.geom.Point(centroid),
            });
            pointer.setStyle(new ol.style.Style({
                image: new ol.style.Icon({
                    src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Free pin icon
                    scale: 0.05, // Adjust size as needed
                    anchor: [0.5, 1], // Bottom-center of the pin
                }),
            }));

            pointerSource.addFeature(pointer);
        }
    }
});
// Add pointers for additional event locations
const additionalLocations = [
    { layerId: 'shops', property: 'Shops', value: 'Student Plaza' },
    { layerId: 'academic', property: 'Name', value: 'AB1' },
    { layerId: 'academic', property: 'Name', value: 'AB2' },
    { layerId: 'academic', property: 'Name', value: 'AB3' },
    { layerId: 'academic', property: 'Name', value: 'AB5' },
    { layerId: 'academic', property: 'Name', value: 'Library' },
    { layerId: 'academic', property: 'Name', value: 'KEF R&D Centre' },
];

additionalLocations.forEach(location => {
    const source = layers[location.layerId].getSource();
    source.once('change', function() {
        if (source.getState() === 'ready') {
            const feature = source.getFeatures().find(f => 
                f.get(location.property) === location.value
            );
            if (feature) {
                const geometry = feature.getGeometry();
                const centroid = ol.extent.getCenter(geometry.getExtent());
                const pointer = new ol.Feature({
                    geometry: new ol.geom.Point(centroid),
                    name: location.value, // Store for reference
                });
                pointer.setStyle(new ol.style.Style({
                    image: new ol.style.Icon({
                        src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
                        scale: 0.05,
                        anchor: [0.5, 1],
                    }),
                }));
                pointerSource.addFeature(pointer);
            }
        }
    });
});

// Click handler for pointers
map.on('click', function(event) {
    const feature = map.forEachFeatureAtPixel(event.pixel, function(feat, layer) {
        return layer === pointerLayer ? feat : null; // Only detect pointerLayer features
    });

    if (feature) {
        const locationName = feature.get('name');
        showEventsPopup(locationName);
    } else {
        const popup = document.getElementById('eventsPopup');
        popup.classList.remove('active');
    }
});

// User Position Tracking
let userPositionSource = new ol.source.Vector();
let userPositionLayer = new ol.layer.Vector({
    source: userPositionSource,
    style: new ol.style.Style({
        image: new ol.style.Circle({
            radius: 8,
            fill: new ol.style.Fill({
                color: 'rgb(188,20,20)'
            }),
            stroke: new ol.style.Stroke({
                color: '#322d2d',
                width: 5
            })
        })
    }),
    zIndex: 1000 // Make sure user position is on top of other layers
});

// Add user position layer to map
map.addLayer(userPositionLayer);

// Pointer layer for event tracking
const pointerSource = new ol.source.Vector();
const pointerLayer = new ol.layer.Vector({
    source: pointerSource,
    zIndex: 1001 // Above other layers, including user position
});
map.addLayer(pointerLayer);

// User position tracking feature
let userPositionFeature = new ol.Feature();
userPositionSource.addFeature(userPositionFeature);

// Position accuracy feature (circle around the position point)
let accuracyFeature = new ol.Feature();
userPositionSource.addFeature(accuracyFeature);

// Store the map extent for reference
let mapExtent = null;

// Geolocation API setup
const geolocation = new ol.Geolocation({
    trackingOptions: {
        enableHighAccuracy: true
    },
    projection: map.getView().getProjection()
});

// Check if a position is within or near the map extent
function isPositionNearMapExtent(coordinates) {
    if (!mapExtent) return true; // If we don't have map extent yet, assume it's fine
    
    // Create a buffered extent (much larger than the actual map extent)
    const buffer = 5000; // Increased buffer in meters (was 1000)
    const bufferedExtent = [
        mapExtent[0] - buffer,
        mapExtent[1] - buffer,
        mapExtent[2] + buffer,
        mapExtent[3] + buffer
    ];
    
    // Check if the position is within the buffered extent
    return ol.extent.containsCoordinate(bufferedExtent, coordinates);
}

// Start tracking position
function startPositionTracking() {
    geolocation.setTracking(true);
    
    // Handle position change
    geolocation.on('change:position', function() {
        const coordinates = geolocation.getPosition();
        if (coordinates) {
            userPositionFeature.setGeometry(coordinates ? 
                new ol.geom.Point(coordinates) : null);
            // Do NOT recenter the map to the user if they are far away
            // Only recenter if followUserPosition is true AND user is near the campus
            if (followUserPosition && isPositionNearMapExtent(coordinates)) {
                map.getView().animate({
                    center: coordinates,
                    duration: 500
                });
            }
            // If user is far, just show the marker, do not recenter
        }
    });
    
    // Handle accuracy change
    geolocation.on('change:accuracyGeometry', function() {
        accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
    });
    
    // Handle error
    geolocation.on('error', function(error) {
        console.error('Geolocation error:', error);
        // Don't show alert, just make sure map is visible
        fitMapToFeatures();
    });
}


document.addEventListener("DOMContentLoaded", function () {
    startPositionTracking();  // Existing line
    
    // Info button toggle
    const infoButton = document.getElementById('infoButton');
    const creditsPopup = document.getElementById('creditsPopup');
    infoButton.addEventListener('click', () => {
        creditsPopup.classList.toggle('active');
    });

    // Attach close event for events popup
    const closeEventsPopupBtn = document.getElementById('closeEventsPopup');
    if (closeEventsPopupBtn) {
        closeEventsPopupBtn.addEventListener('click', function() {
            document.getElementById('eventsPopup').classList.remove('active');
        });
    }
});

// Show warning when user is far from the mapped area
function showLocationWarning() {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('location-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'location-notification';
        notification.className = 'location-notification';
        document.querySelector('.game-container').appendChild(notification);
        
        // Add styles for the notification if not already in CSS
        const style = document.createElement('style');
        style.textContent = `
            .location-notification {
                position: absolute;
                top: 70px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                z-index: 1001;
                text-align: center;
                max-width: 80%;
                animation: fadeInOut 5s forwards;
            }
            @keyframes fadeInOut {
                0% { opacity: 0; }
                10% { opacity: 1; }
                80% { opacity: 1; }
                100% { opacity: 0; display: none; }
            }
        `;
        document.head.appendChild(style);
    }
    
    notification.textContent = 'You are far from the mapped area. Map view has been centered on the campus.';
    notification.style.animation = 'none';
    notification.offsetHeight; // Trigger reflow
    notification.style.animation = 'fadeInOut 5s forwards';
    
    // Remove notification after animation completes
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Flag to determine if map should follow user position
let followUserPosition = false;

// Get the tracking and simulate location buttons
const trackingButton = document.getElementById('toggleTracking');

// Replace the tracking button event listener with this:
trackingButton.addEventListener('click', () => {
    // Always center on current position when clicked
    if (geolocation.getPosition()) {
        const coordinates = geolocation.getPosition();
        if (isPositionNearMapExtent(coordinates)) {
            map.getView().animate({
                center: coordinates,
                duration: 500
            });
        } else {
            showLocationWarning();
            fitMapToFeatures();
        }
    } else {
        fitMapToFeatures();
    }

    // Optionally toggle visual active state without changing functionality
    trackingButton.classList.add('active');
    setTimeout(() => {
        trackingButton.classList.remove('active');
    }, 1000);
});

// Add this after the tracking button code
map.on('pointerdrag', function() {
    // User is manually panning, disable following
    followUserPosition = false;
});



// Fit Map to Features
function fitMapToFeatures() {
    let extent = null;
    let loadedSources = 0;

    vectorSources.forEach(source => {
        source.once('change', function() {
            if (source.getState() === 'ready') {
                const sourceExtent = source.getExtent();
                if (extent === null) {
                    extent = sourceExtent;
                } else {
                    extent = ol.extent.extend(extent, sourceExtent);
                }
                
                loadedSources++;
                
                if (loadedSources === vectorSources.length) {
                    // Store the map extent for reference
                    mapExtent = extent;
                    
                    const view = map.getView();
                    view.fit(extent, {
                        padding: [50, 50, 50, 50],
                        maxZoom: 19,
                        duration: 0 // Instant fit
                    });
                    map.render(); // Force render after fit
                }
            }
        });
    });

    // Fallback: render after a short delay if sources don't load
    setTimeout(() => {
        if (loadedSources === 0) {
            map.render();
        }
    }, 500);
}

// Function to initialize rotation controls
function initRotationControls() {
    // Get the north arrow element
    const northArrow = document.getElementById('northArrow');
    
    // Update north arrow based on map rotation
    function updateNorthArrow() {
        const rotation = map.getView().getRotation();
        const rotationDegrees = +rotation * 180 / Math.PI;
        northArrow.style.transform = `rotate(${rotationDegrees}deg)`;
    }

    // Update arrow on map render
    map.on('postrender', updateNorthArrow);

    // Direct event listeners for rotation buttons
    document.getElementById('rotateLeft').onclick = function() {
        const view = map.getView();
        view.animate({
            rotation: view.getRotation() - Math.PI / 6,
            duration: 250
        });
    };

    document.getElementById('rotateRight').onclick = function() {
        const view = map.getView();
        view.animate({
            rotation: view.getRotation() + Math.PI / 6,
            duration: 250
        });
    };

    document.getElementById('resetRotation').onclick = function() {
        const view = map.getView();
        view.animate({
            rotation: 0,
            duration: 250
        });
    };
}

// Initialize rotation controls after map is fully loaded
map.once('postrender', initRotationControls);

// UI Controls
const legendPanel = document.getElementById('legendPanel');
const searchPanel = document.getElementById('searchPanel');
const locationPopup = document.getElementById('locationPopup');
const popupTitle = document.getElementById('popupTitle');
const popupDescription = document.getElementById('popupDescription');
const popupTimestamp = document.getElementById('popupTimestamp');
const currentZoom = document.getElementById('currentZoom');
const currentTime = document.getElementById('currentTime');

// Toggle Controls
document.getElementById('toggleLegend').addEventListener('click', () => {
    legendPanel.classList.toggle('active');
    searchPanel.classList.remove('active');
});

document.getElementById('toggleSearch').addEventListener('click', () => {
    searchPanel.classList.add('active');
    legendPanel.classList.remove('active');
});

document.getElementById('closeLegend').addEventListener('click', () => {
    legendPanel.classList.remove('active');
});



// Zoom Controls
document.getElementById('zoomIn').addEventListener('click', (event) => {
    event.stopPropagation();
    const view = map.getView();
    const currentZoom = view.getZoom();
    if (currentZoom < 19) {
        view.animate({ zoom: currentZoom + 1, duration: 150 });
    }
});

document.getElementById('zoomOut').addEventListener('click', (event) => {
    event.stopPropagation();
    const view = map.getView();
    const currentZoom = view.getZoom();
    if (currentZoom > 16) {
        view.animate({ zoom: currentZoom - 1, duration: 150 });
    }
});

// Center Map Button
document.getElementById('centerMap').addEventListener('click', () => {
    fitMapToFeatures();
});

// Search Functionality
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

function createSearchIndex() {
    const searchIndex = [];
    // Add places
    Object.values(layers).forEach(layer => {
        const source = layer.getSource();
        if (source) {
            source.getFeatures().forEach(feature => {
                const name = feature.get('Name') || feature.get('Shops') || feature.get('Sports') || feature.get('Name/Num');
                if (name) {
                    searchIndex.push({
                        type: 'place',
                        name: name,
                        feature: feature
                    });
                }
            });
        }
    });
    // Add events
    eventsData.forEach(event => {
        if (event.event_name) {
            // Use event_name as the searchable name
            // Also store the location name for opening the sidebar
            const locationName = event.Name || event.Shops || event.Sports;
            searchIndex.push({
                type: 'event',
                name: event.event_name,
                event: event,
                locationName: locationName
            });
        }
    });
    return searchIndex;
}

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    const searchIndex = createSearchIndex();
    searchResults.innerHTML = '';

    if (query.length < 2) return;

    // Find matches (case-insensitive, ignore extra spaces)
    const matches = searchIndex.filter(item =>
        item.name && item.name.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
        // Show 'Place not found' if no matches
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.textContent = 'Place or event not found';
        div.style.color = 'red';
        searchResults.appendChild(div);
        return;
    }

    matches.forEach(match => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        if (match.type === 'place') {
            div.textContent = match.name + ' (Place)';
            div.addEventListener('click', () => {
                const extent = match.feature.getGeometry().getExtent();
                map.getView().fit(extent, {
                    padding: [50, 50, 50, 50],
                    duration: 1000,
                    maxZoom: 19
                });
                showFeaturePopup(match.feature);
                searchPanel.classList.remove('active');
            });
        } else if (match.type === 'event') {
            div.textContent = match.name + ' (Event)';
            div.style.fontStyle = 'italic';
            div.addEventListener('click', () => {
                // Open the events sidebar for this event's location
                if (match.locationName) {
                    showEventsPopup(match.locationName);
                } else {
                    // If no location, just show the event details
                    const content = document.getElementById('eventsContent');
                    content.innerHTML = `
                        <h2>${match.event.event_name}</h2>
                        <p><strong>Type:</strong> ${match.event.event_type}</p>
                        <p><strong>Description:</strong> ${match.event.event_desc.replace(/\n/g, '<br>')}</p>
                        <p><strong>Date:</strong> ${new Date(match.event.event_date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${match.event.event_time}</p>
                        <p><strong>Venue:</strong> ${match.event.venue_name}</p>
                        <p><strong>Team Type:</strong> ${match.event.team_type}</p>
                    `;
                    document.getElementById('eventsPopup').classList.add('active');
                }
                searchPanel.classList.remove('active');
            });
        }
        searchResults.appendChild(div);
    });
});

// Show Feature Popup (Updated to use sidebar)
function showFeaturePopup(feature) {
    const name = feature.get('Name') || 'Unnamed Location';
    const description = feature.get('description') || 'No description available';

    popupTitle.textContent = name;
    popupDescription.textContent = description;
    popupTimestamp.textContent = new Date().toLocaleTimeString();

    locationPopup.classList.add('active');
}

// Map Click Handler (Updated)
map.on('click', function(event) {
    const feature = map.forEachFeatureAtPixel(event.pixel, function(feature) {
        return feature;
    });

    if (feature) {
        showFeaturePopup(feature);
    } else {
        locationPopup.classList.remove('active');
    }
});

// Hover Effect
map.on('pointermove', function(event) {
    const pixel = map.getEventPixel(event.originalEvent);
    const hit = map.hasFeatureAtPixel(pixel);
    map.getTarget().style.cursor = hit ? 'pointer' : '';
});

// Update Stats
map.getView().on('change:resolution', function() {
    currentZoom.textContent = `Zoom: ${Math.round(map.getView().getZoom())}`;
});

// Update Time
function updateTime() {
    currentTime.textContent = new Date().toLocaleTimeString();
}
setInterval(updateTime, 1000);

// Initialize Map
fitMapToFeatures();
updateTime();

// Show events popup
function showEventsPopup(locationName) {
    const relevantEvents = eventsData.filter(event => 
        (event.Name && event.Name === locationName) ||
        (event.Shops && event.Shops === locationName) ||
        (event.Sports && event.Sports === locationName)
    );

    const popup = document.getElementById('eventsPopup');
    const content = document.getElementById('eventsContent');

    // Clear previous content
    content.innerHTML = '';

    // Build events list
    content.innerHTML = `
        <h2>Events at ${locationName}</h2>
        <ul class="events-list">
            ${relevantEvents.map(event => `
                <li class="event-item" onclick="showEventDetails('${event.event_name.replace(/'/g, "\\'")}', '${locationName.replace(/'/g, "\\'")}')">
                    <strong>${event.event_name}</strong><br>
                    ${new Date(event.event_date).toLocaleDateString()} ${event.event_time}
                </li>
            `).join('')}
        </ul>
    `;

    popup.classList.add('active');
}

// Show event details
function showEventDetails(eventName, locationName) {
    const event = eventsData.find(e => 
        e.event_name === eventName && (
            (e.Name && e.Name === locationName) ||
            (e.Shops && e.Shops === locationName) ||
            (e.Sports && e.Sports === locationName)
        )
    );

    const content = document.getElementById('eventsContent');
    content.innerHTML = `
        <h2>${event.event_name}</h2>
        <p><strong>Type:</strong> ${event.event_type}</p>
        <p><strong>Description:</strong> ${event.event_desc.replace(/\n/g, '<br>')}</p>
        <p><strong>Date:</strong> ${new Date(event.event_date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${event.event_time}</p>
        <p><strong>Venue:</strong> ${event.venue_name}</p>
        <p><strong>Team Type:</strong> ${event.team_type}</p>
        <button onclick="showEventsPopup('${locationName.replace(/'/g, "\\'")}')">Back to Events</button>
    `;
}
