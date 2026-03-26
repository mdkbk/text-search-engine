package engine;
public class SearchResult {
    private String documentName;
    private int frequency;

    public SearchResult(String documentName, int frequency) {
        this.documentName = documentName;
        this.frequency = frequency;
    }

    public String getDocumentName() {
        return documentName;
    }

    public int getFrequency() {
        return frequency;
    }
}