package engine;

import model.Document;

import java.util.*;

public class Indexer {
    private final Map<String, List<Document>> keywordIndex = new HashMap<>();

    public void buildIndex(List<Document> documents) {
        keywordIndex.clear();

        for (Document document : documents) {
            String content = document.getContent().toLowerCase();
            String[] words = content.split("\\W+");

            Set<String> uniqueWords = new HashSet<>(Arrays.asList(words));

            for (String word : uniqueWords) {
                if (word == null || word.isBlank()) {
                    continue;
                }
                keywordIndex.computeIfAbsent(word, k -> new ArrayList<>()).add(document);
            }
        }
    }

    public List<Document> searchByKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return new ArrayList<>();
        }
        return keywordIndex.getOrDefault(keyword.toLowerCase(), new ArrayList<>());
    }

    public boolean containsKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return false;
        }
        return keywordIndex.containsKey(keyword.toLowerCase());
    }

    public Map<String, List<Document>> getKeywordIndex() {
        return keywordIndex;
    }
}