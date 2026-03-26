package engine;

import model.Document;
import util.DocumentLoader;
import util.TextPreprocessor;
import java.util.List;
import java.util.ArrayList;
import input.ManualTextInput;

public class SearchEngine {

    private DocumentLoader documentLoader = new DocumentLoader();
    private TextPreprocessor preprocessor = new TextPreprocessor();
    private algorithms.BoyerMoore boyerMoore = new algorithms.BoyerMoore();
    private ManualTextInput manualTextInput = new ManualTextInput();

    private Indexer indexer = new Indexer();
    private FrequencyAnalyzer frequencyAnalyzer = new FrequencyAnalyzer();

    public void search(String query) {

        if (query == null || query.trim().isEmpty()) {
            System.out.println("Search query cannot be empty.");
            return;
        }

        String processedQuery = preprocessor.preprocess(query);
        List<Document> documents = documentLoader.loadDocuments("documents");

        if (documents.isEmpty()) {
            System.out.println("No documents found.");
            return;
        }

        indexer.buildIndex(documents);

        List<Document> indexedDocuments = indexer.searchByKeyword(processedQuery);

        if (!indexedDocuments.isEmpty()) {
            displaySearchResults(query, processedQuery, indexedDocuments);
        } else {
            displaySearchResults(query, processedQuery, documents);
        }
    }

    public void searchInManualText(String text, String query) {
        if (query == null || query.trim().isEmpty()) {
            System.out.println("Please enter a query.");
            return;
        }

        Document manualDocument = manualTextInput.createDocumentFromText(text);

        if (manualDocument == null) {
            System.out.println("Please enter text.");
            return;
        }

        String processedQuery = preprocessor.preprocess(query);
        List<Document> documents = new ArrayList<>();
        documents.add(manualDocument);

        indexer.buildIndex(documents);
        displaySearchResults(query, processedQuery, documents);
    }

    private void displaySearchResults(String originalQuery, String processedQuery, List<Document> documents) {
        List<SearchResult> substringResults = new ArrayList<>();
        List<SearchResult> wholeWordResults = new ArrayList<>();

        for (Document doc : documents) {
            String content = preprocessor.preprocess(doc.getContent());

            int substringCount = boyerMoore.countOccurrences(content, processedQuery);
            int wholeWordCount = countWholeWordOccurrences(content, processedQuery);
            int frequencyCount = frequencyAnalyzer.countFrequency(content, processedQuery);

            if (substringCount > 0) {
                substringResults.add(new SearchResult(doc.getName(), substringCount));
            }

            if (wholeWordCount > 0) {
                wholeWordResults.add(new SearchResult(doc.getName(), wholeWordCount));
            }

            System.out.println("\nDocument: " + doc.getName() + " | Total Frequency: " + frequencyCount);
        }

        System.out.println("\nSearch Results for: " + originalQuery);

        System.out.println("\nSubstring Match Results:");
        if (substringResults.isEmpty()) {
            System.out.println("No substring matches found.");
        } else {
            for (SearchResult result : substringResults) {
                System.out.println(result.getDocumentName() + " -> " + result.getFrequency() + " matches");
            }
        }

        System.out.println("\nExact Match Results:");
        if (wholeWordResults.isEmpty()) {
            System.out.println("No whole word matches found.");
        } else {
            for (SearchResult result : wholeWordResults) {
                System.out.println(result.getDocumentName() + " -> " + result.getFrequency() + " matches");
            }
        }
    }

    private int countWholeWordOccurrences(String text, String query) {
        if (text == null || query == null || query.isEmpty()) {
            return 0;
        }

        String[] words = text.split(" ");
        int count = 0;

        for (String word : words) {
            if (word.equals(query)) {
                count++;
            }
        }

        return count;
    }
}