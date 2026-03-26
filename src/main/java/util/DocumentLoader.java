package util;
import model.Document;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;


public class DocumentLoader {

    public List<Document> loadDocuments(String folderPath) {
        List<Document> documents = new ArrayList<>();

        File folder = new File(folderPath);

        if (!folder.exists() || !folder.isDirectory()) {
            System.out.println("Invalid documents folder path: " + folderPath);
            return documents;
        }

        File[] files = folder.listFiles();

        if (files == null) {
            System.out.println("No files found in folder: " + folderPath);
            return documents;
        }

        for (File file : files) {
            if (file.isFile() && file.getName().endsWith(".txt")) {
                try {
                    String content = Files.readString(file.toPath());
                    documents.add(new Document(file.getName(), content));
                } catch (IOException e) {
                    System.out.println("Error reading file: " + file.getName());
                }
            }
        }

        return documents;
    }
}