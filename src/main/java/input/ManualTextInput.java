package input;
import model.Document;
public class ManualTextInput {

    public Document createDocumentFromText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }

        return new Document("Found", text);
    }
}