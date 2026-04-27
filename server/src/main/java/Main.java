import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import engine.SearchEngine;



import java.io.*;
import java.net.InetSocketAddress;
import java.nio.file.Files;

public class Main {

    public static void main(String[] args) throws Exception {
        SearchEngine searchEngine = new SearchEngine();
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        // ── Serve frontend files 
        server.createContext("/", exchange -> {
            String path = exchange.getRequestURI().getPath();
            if (path.equals("/")) path = "/index.html";

            File file;
            if (path.equals("/index.html")) {
                // templates/index.html
                file = new File("../client/src/templates/index.html");
            } else if (path.startsWith("/static/css/")) {
                // /static/css/main.css → client/src/static/css/main.css
                file = new File("../client/src/" + path.substring(1));
            } else if (path.startsWith("/static/js/")) {
                // /static/js/app.js → client/src/js/app.js
                String fileName = path.substring("/static/js/".length());
                file = new File("../client/src/js/" + fileName);
            } else {
                file = new File("../client/src" + path);
            }

            if (!file.exists()) {
                byte[] msg = ("404 Not Found: " + path + " (looked at: " + file.getPath() + ")").getBytes();
                exchange.sendResponseHeaders(404, msg.length);
                exchange.getResponseBody().write(msg);
                exchange.getResponseBody().close();
                return;
            }

            byte[] bytes = Files.readAllBytes(file.toPath());
            exchange.getResponseHeaders().set("Content-Type", getContentType(path));
            exchange.sendResponseHeaders(200, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.getResponseBody().close();
        });

        // ── List all documents ────────────────────────────────
server.createContext("/api/documents", exchange -> {
    exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
    exchange.getResponseHeaders().set("Content-Type", "application/json");

    File docsDir = new File("docs");
    StringBuilder json = new StringBuilder("[");

    if (docsDir.exists() && docsDir.isDirectory()) {
        File[] files = docsDir.listFiles((d, name) -> name.endsWith(".txt"));
        if (files != null) {
            for (int i = 0; i < files.length; i++) {
                json.append("\"").append(files[i].getName()).append("\"");
                if (i < files.length - 1) json.append(",");
            }
        }
    }
    json.append("]");

    byte[] resp = json.toString().getBytes();
    exchange.sendResponseHeaders(200, resp.length);
    exchange.getResponseBody().write(resp);
    exchange.getResponseBody().close();
});

// Load a specific document 
server.createContext("/api/document", exchange -> {
    exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
    exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");

    String query    = exchange.getRequestURI().getQuery();
    String fileName = "";
    if (query != null && query.startsWith("file=")) {
        fileName = query.substring(5).replace("%20", " ").replace("+", " ");
    }

    fileName = new File(fileName).getName();
    File file = new File("docs/" + fileName);

    if (!file.exists() || !fileName.endsWith(".txt")) {
        byte[] msg = "File not found".getBytes();
        exchange.sendResponseHeaders(404, msg.length);
        exchange.getResponseBody().write(msg);
        exchange.getResponseBody().close();
        return;
    }

    byte[] bytes = Files.readAllBytes(file.toPath());
    exchange.sendResponseHeaders(200, bytes.length);
    exchange.getResponseBody().write(bytes);
    exchange.getResponseBody().close();
});

        // ── Search API
        server.createContext("/api/search", exchange -> {
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Content-Type", "application/json");

            if (!exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }

            String body      = new String(exchange.getRequestBody().readAllBytes());
            String text      = extractJson(body, "text");
            String pattern   = extractJson(body, "pattern");
            String algorithm = extractJson(body, "algorithm");
            boolean cs       = body.contains("\"caseSensitive\":true");
            boolean ww       = body.contains("\"wholeWord\":true");

            String searchText = cs ? text    : text.toLowerCase();
            String searchPat  = cs ? pattern : pattern.toLowerCase();

            SearchEngine.SearchResult result = searchEngine.searchWithStats(searchText, searchPat, algorithm);

            if (ww) {
                result.positions.removeIf(pos -> {
                    boolean before = pos == 0 || !Character.isLetterOrDigit(searchText.charAt(pos - 1));
                    boolean after  = (pos + searchPat.length() >= searchText.length()) ||
                                     !Character.isLetterOrDigit(searchText.charAt(pos + searchPat.length()));
                    return !(before && after);
                });
            }

            String json = String.format(
                "{\"positions\":%s,\"comparisons\":%d,\"shifts\":%d}",
                result.positions.toString(), result.comparisons, result.shifts
            );

            byte[] resp = json.getBytes();
            exchange.sendResponseHeaders(200, resp.length);
            exchange.getResponseBody().write(resp);
            exchange.getResponseBody().close();
        });

        server.setExecutor(null);
        server.start();

        System.out.println("╔══════════════════════════════════════╗");
        System.out.println("║   BM Search Engine — Server Started  ║");
        System.out.println("║   Open: http://localhost:8080         ║");
        System.out.println("╚══════════════════════════════════════╝");
    }

    private static String getContentType(String path) {
        if (path.endsWith(".html")) return "text/html";
        if (path.endsWith(".css"))  return "text/css";
        if (path.endsWith(".js"))   return "application/javascript";
        return "text/plain";
    }

    private static String extractJson(String json, String key) {
        String search = "\"" + key + "\":\"";
        int start = json.indexOf(search);
        if (start == -1) return "";
        start += search.length();
        int end = json.indexOf("\"", start);
        return end == -1 ? "" : json.substring(start, end)
            .replace("\\n", "\n").replace("\\t", "\t").replace("\\\"", "\"");
    }
}