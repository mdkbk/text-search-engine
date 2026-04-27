package algorithms;

import engine.SearchEngine.SearchResult;
import java.util.HashMap;
import java.util.Map;

public class BoyerMoore {

    /**
     * Boyer-Moore search using bad-character heuristic.
     * Returns positions, comparisons, and shifts as a SearchResult.
     */
    public static SearchResult search(String text, String pattern) {
        SearchResult result = new SearchResult();
        int n = text.length();
        int m = pattern.length();
        if (m == 0) return result;

        // Build bad-character table
        Map<Character, Integer> badChar = new HashMap<>();
        for (int i = 0; i < m; i++) {
            badChar.put(pattern.charAt(i), i);
        }

        int s = 0;
        while (s <= n - m) {
            int j = m - 1;

            while (j >= 0) {
                result.comparisons++;
                if (pattern.charAt(j) != text.charAt(s + j)) break;
                j--;
            }

            if (j < 0) {
                // Full match found
                result.positions.add(s);
                int next = (s + m < n) ? m - badChar.getOrDefault(text.charAt(s + m), -1) : 1;
                s += next;
            } else {
                // Bad-character shift
                int bc = j - badChar.getOrDefault(text.charAt(s + j), -1);
                s += Math.max(1, bc);
            }
            result.shifts++;
        }

        return result;
    }
}

