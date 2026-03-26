package util;

import engine.SearchEngine;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        SearchEngine searchEngine = new SearchEngine();

        System.out.println("Mini Search Engine");
        System.out.println("------------------");
        System.out.println("1. Search in Documents");
        System.out.println("2. Search in Custom Text");
        System.out.print("Choose an option: ");

        String choice = scanner.nextLine();

        if (choice.equals("1")) {
            System.out.print("Enter search query: ");
            String query = scanner.nextLine();
            searchEngine.search(query);

        } else if (choice.equals("2")) {
            System.out.print("Enter text: ");
            String text = scanner.nextLine();

            System.out.print("Enter search query: ");
            String query = scanner.nextLine();

            searchEngine.searchInManualText(text, query);

        } else {
            System.out.println("Invalid option :(");
        }

        scanner.close();
    }
}