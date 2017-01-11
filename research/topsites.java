import java.io.File;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.FileWriter; 
import java.io.FileNotFoundException;
import java.io.IOException; 
import java.net.MalformedURLException;  
import java.net.URL;  
import java.util.ArrayList;  
import java.util.List;  
import java.util.regex.Matcher;  
import java.util.regex.Pattern;  

class webcontent {

	public String getHtmlContent(String htmlurl) {  
        URL url;  
        String temp;  
        StringBuffer sb = new StringBuffer();  

        try {  
            url = new URL(htmlurl);  
            BufferedReader in = new BufferedReader(new InputStreamReader(url.openStream(), "gbk")); 
            while ((temp = in.readLine()) != null) {  
                sb.append(temp);  
            }  
            in.close();  
        } catch (final MalformedURLException me) {  
            System.out.println("Wrong URL!");  
            me.getMessage();  
        } catch (final IOException e) {  
            e.printStackTrace();  
        }  
        return sb.toString();  
    }  
}

public class topsites { 	
	
	public static void main(String[] args) {
		String csvFile = "top-1m.csv";
		String line = "";
		String cvssplit = ",";


		try(BufferedReader br = new BufferedReader (new FileReader(csvFile))) {
			line = br.readLine();
			String[] site = line.split(cvssplit);
			File writepath = new File("output.txt");
			writepath.createNewFile();
			BufferedWriter out = new BufferedWriter(new FileWriter(writepath));

			while((line != null) && (Integer.parseInt(site[0]) <= 1000)) {
				System.out.println(site[0]);
				out.write(site[1] + "\r\n");
				webcontent web = new webcontent();
				out.write(web.getHtmlContent("http://cos432-assn3.cs.princeton.edu/traceroute?q=" + site[1]) + "\r\n");
				line = br.readLine();
				site = line.split(cvssplit);
			}
			br.close();
			out.close();
		} catch (IOException e) {
				e.printStackTrace();
			}	
	}
}