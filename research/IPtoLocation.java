import Facebook.SpreadsheetEvaluation;

import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by lin on 1/10/17.
 */
public class IPtoLocation {

    static class Location {
        double lat;
        double lng;

        Location(double lat, double lng) {
            this.lat = lat;
            this.lng = lng;
        }

        public String toString() {
            return lat + "," + lng;
        }
    }

    public static void main(String[] args) {
        Map<String, Location> ipLocation = new HashMap<>();
        int hostCounter = 0;
        long startTime = System.currentTimeMillis();
        try (final BufferedReader br = new BufferedReader(new FileReader("output.txt"))) {
            String curRow;
            boolean hostRow = true;
            String lastHost = "";
            while ((curRow = br.readLine()) != null) {
//                System.out.println(curRow);
                if (!hostRow) {
                    hostCounter++;
                    if (!curRow.isEmpty()) {
                        String[] ips = curRow.split(",");
                        for (String ip : ips) {
                            if (!ipLocation.containsKey(ip)) {
                                Location loc = getLocation(ip);
                                if (loc == null) {
                                    System.out.println("Can't find location for host: " + lastHost + ", ip: " + ip);
                                } else {
                                    ipLocation.put(ip, loc);
                                }
                            }
                        }
                    }
                    System.out.println("Last finished host: " + lastHost);
                    if (hostCounter > 0 && hostCounter % 5 == 0) {
                        System.out.println("Finished " + hostCounter + " out of 1000 hostnames. Took " +
                                ((System.currentTimeMillis() - startTime) / 1000.0) + " seconds. " +
                                "Current number of unique ips: " + ipLocation.size() + ".");
                    }
                } else {
                    lastHost = curRow;
                }
                hostRow = !hostRow;
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("WTF???");
            return;
        }

        System.out.println("total number of unique ips: " + ipLocation.size());

        // write cells to output file
        try (final BufferedWriter bw = new BufferedWriter(new FileWriter("ip2location.txt"))) {
            for (Map.Entry entry : ipLocation.entrySet()) {
                bw.write(entry.getKey() + "," + entry.getValue() + "\n");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static Location getLocation(String ip) throws IOException {
        URL url = new URL("http://ipinfo.io/" + ip + "/json");
        URLConnection connection = url.openConnection();
        BufferedReader in = new BufferedReader(
                new InputStreamReader(
                        connection.getInputStream()));
        String inputLine;
        /*
        {
  "ip": "67.195.1.251",
  "hostname": "No Hostname",
  "city": "Sunnyvale",
  "region": "California",
  "country": "US",
  "loc": "37.4249,-122.0074",
  "org": "AS36647 Yahoo",
  "postal": "94089"
}
         */
        while ((inputLine = in.readLine()) != null) {
            if (inputLine.contains("\"loc\":")) {
                Location location = getLocationFromString(inputLine);
                in.close();
                return location;
            }
        }
        in.close();
        return null;
    }

    static final Pattern pattern = Pattern.compile("\"(.*?)\"");
    private static Location getLocationFromString(String str) {
//        System.out.println(str);
        Matcher matcher = pattern.matcher(str);
        matcher.find();
        matcher.find();
        String[] locationStr = matcher.group(1).split(",");
        return new Location(Double.parseDouble(locationStr[0]),
                            Double.parseDouble(locationStr[1]));
    }
}
