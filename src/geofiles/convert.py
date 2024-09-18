import json

# Function to convert AIP coordinates to decimal degrees
def convert_aip_to_decimal(coord):
    # Latitude conversion (first 2 digits for degrees, next 2 for minutes, last 2 for seconds)
    lat_deg = int(coord[0][:2])
    lat_min = int(coord[0][2:4])
    lat_sec = int(coord[0][4:6])
    lat_decimal = lat_deg + lat_min / 60 + lat_sec / 3600

    # Longitude conversion (first 3 digits for degrees, next 2 for minutes, last 2 for seconds)
    lon_deg = int(coord[1][:3])
    lon_min = int(coord[1][3:5])
    lon_sec = int(coord[1][5:7])
    lon_decimal = lon_deg + lon_min / 60 + lon_sec / 3600

    return [lon_decimal, lat_decimal]  # GeoJSON format [longitude, latitude]

# Function to ensure the shape is closed
def close_shape(coordinates):
    if coordinates[0] != coordinates[-1]:
        coordinates.append(coordinates[0])
    return coordinates

# Function to convert airspace data into GeoJSON format
def convert_to_geojson(airspace):
    features = []
    for sector in airspace["sectors"]:
        points = [convert_aip_to_decimal(point) for point in sector["points"]]
        points = close_shape(points)
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    points
                ]
            },
            "properties": {
                "id": airspace["id"],
                "group": airspace["group"],
                "owner": airspace["owner"],
                "maxAltitude": sector["max"],
                "minAltitude": sector["min"]
            }
        }
        features.append(feature)
    return features

# Load the sweden.json file
with open('sweden.json', 'r') as f:
    sweden_data = json.load(f)

# Initialize the GeoJSON structure
geojson = {
    "type": "FeatureCollection",
    "features": []
}

# Convert each airspace entry into GeoJSON format
for airspace in sweden_data["airspace"]:
    geojson["features"].extend(convert_to_geojson(airspace))

# Save the GeoJSON output to a file
with open('sweden_converted.geojson', 'w') as f:
    json.dump(geojson, f, indent=2)

print("Conversion completed. GeoJSON saved as 'sweden_converted.geojson'")
