package engine;

import algorithms.BoyerMoore;

public class FrequencyAnalyzer {

    private BoyerMoore boyerMoore = new BoyerMoore();

    public int countFrequency(String text, String keyword) {
        if (text == null || keyword == null || keyword.trim().isEmpty()) {
            return 0;
        }

        return boyerMoore.countOccurrences(text.toLowerCase(), keyword.toLowerCase());
    }
}