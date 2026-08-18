"""
Language wrappers and harnesses for C++ and Java for all Code Arena Problem Bank problems.
Provides high-performance stdin JSON parsing, user code invocation, and stdout JSON serialization.
"""

CPP_HEADER_AND_PARSER = """#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <unordered_map>
#include <unordered_set>
#include <iomanip>
#include <cctype>

using namespace std;

// --- USER CODE START ---
{{USER_CODE}}
// --- USER CODE END ---

namespace ArenaJSON {
    inline void skip_whitespace(const string& s, size_t& pos) {
        while (pos < s.size() && (s[pos] == ' ' || s[pos] == '\\t' || s[pos] == '\\n' || s[pos] == '\\r')) {
            pos++;
        }
    }

    inline int parse_int(const string& s, size_t& pos) {
        skip_whitespace(s, pos);
        size_t start = pos;
        if (pos < s.size() && (s[pos] == '-' || s[pos] == '+')) pos++;
        while (pos < s.size() && isdigit(s[pos])) pos++;
        return (pos > start) ? stoi(s.substr(start, pos - start)) : 0;
    }

    inline double parse_double(const string& s, size_t& pos) {
        skip_whitespace(s, pos);
        size_t start = pos;
        if (pos < s.size() && (s[pos] == '-' || s[pos] == '+')) pos++;
        while (pos < s.size() && (isdigit(s[pos]) || s[pos] == '.' || s[pos] == 'e' || s[pos] == 'E' || s[pos] == '-' || s[pos] == '+')) {
            if ((s[pos] == '-' || s[pos] == '+') && pos != start && s[pos-1] != 'e' && s[pos-1] != 'E') break;
            pos++;
        }
        return (pos > start) ? stod(s.substr(start, pos - start)) : 0.0;
    }

    inline bool parse_bool(const string& s, size_t& pos) {
        skip_whitespace(s, pos);
        if (pos + 4 <= s.size() && s.substr(pos, 4) == "true") {
            pos += 4;
            return true;
        }
        if (pos + 5 <= s.size() && s.substr(pos, 5) == "false") {
            pos += 5;
            return false;
        }
        return false;
    }

    inline string parse_string(const string& s, size_t& pos) {
        skip_whitespace(s, pos);
        if (pos >= s.size() || s[pos] != '"') return "";
        pos++;
        string res = "";
        while (pos < s.size() && s[pos] != '"') {
            if (s[pos] == '\\\\' && pos + 1 < s.size()) {
                pos++;
                if (s[pos] == 'n') res += '\\n';
                else if (s[pos] == 't') res += '\\t';
                else if (s[pos] == '"') res += '"';
                else if (s[pos] == '\\\\') res += '\\\\';
                else res += s[pos];
            } else {
                res += s[pos];
            }
            pos++;
        }
        if (pos < s.size() && s[pos] == '"') pos++;
        return res;
    }

    inline vector<int> parse_vector_int(const string& s, size_t& pos) {
        skip_whitespace(s, pos);
        vector<int> res;
        if (pos >= s.size() || s[pos] != '[') return res;
        pos++;
        skip_whitespace(s, pos);
        if (pos < s.size() && s[pos] == ']') {
            pos++;
            return res;
        }
        while (pos < s.size()) {
            skip_whitespace(s, pos);
            res.push_back(parse_int(s, pos));
            skip_whitespace(s, pos);
            if (pos < s.size() && s[pos] == ',') {
                pos++;
            } else if (pos < s.size() && s[pos] == ']') {
                pos++;
                break;
            }
        }
        return res;
    }

    inline vector<string> parse_vector_string(const string& s, size_t& pos) {
        skip_whitespace(s, pos);
        vector<string> res;
        if (pos >= s.size() || s[pos] != '[') return res;
        pos++;
        skip_whitespace(s, pos);
        if (pos < s.size() && s[pos] == ']') {
            pos++;
            return res;
        }
        while (pos < s.size()) {
            skip_whitespace(s, pos);
            res.push_back(parse_string(s, pos));
            skip_whitespace(s, pos);
            if (pos < s.size() && s[pos] == ',') {
                pos++;
            } else if (pos < s.size() && s[pos] == ']') {
                pos++;
                break;
            }
        }
        return res;
    }

    inline vector<vector<char>> parse_vector_vector_char(const string& s, size_t& pos) {
        skip_whitespace(s, pos);
        vector<vector<char>> res;
        if (pos >= s.size() || s[pos] != '[') return res;
        pos++;
        skip_whitespace(s, pos);
        if (pos < s.size() && s[pos] == ']') {
            pos++;
            return res;
        }
        while (pos < s.size()) {
            skip_whitespace(s, pos);
            vector<string> row_str = parse_vector_string(s, pos);
            vector<char> row;
            for (const string& str : row_str) {
                row.push_back(str.empty() ? '0' : str[0]);
            }
            res.push_back(row);
            skip_whitespace(s, pos);
            if (pos < s.size() && s[pos] == ',') {
                pos++;
            } else if (pos < s.size() && s[pos] == ']') {
                pos++;
                break;
            }
        }
        return res;
    }

    inline void print(int val) { cout << val; }
    inline void print(long long val) { cout << val; }
    inline void print(double val) {
        if (val == (long long)val) {
            cout << fixed << setprecision(1) << val;
        } else {
            cout << fixed << setprecision(5) << val;
        }
    }
    inline void print(bool val) { cout << (val ? "true" : "false"); }
    inline void print(const string& val) { cout << "\\"" << val << "\\""; }
    inline void print(char val) { cout << "\\"" << val << "\\""; }

    template<typename T>
    inline void print(const vector<T>& vec) {
        cout << "[";
        for (size_t i = 0; i < vec.size(); i++) {
            if (i > 0) cout << ",";
            print(vec[i]);
        }
        cout << "]";
    }
}
"""

CPP_MAINS = {
    "signal-pair": """
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string input, line;
    while (getline(cin, line)) input += line;
    if (input.empty()) return 0;
    size_t pos = 0;
    ArenaJSON::skip_whitespace(input, pos);
    if (pos < input.size() && input[pos] == '[') pos++;
    vector<int> arg1 = ArenaJSON::parse_vector_int(input, pos);
    ArenaJSON::skip_whitespace(input, pos);
    if (pos < input.size() && input[pos] == ',') pos++;
    int arg2 = ArenaJSON::parse_int(input, pos);
    vector<int> res = solve(arg1, arg2);
    ArenaJSON::print(res);
    cout << endl;
    return 0;
}
""",
    "best-trade-window": """
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string input, line;
    while (getline(cin, line)) input += line;
    if (input.empty()) return 0;
    size_t pos = 0;
    ArenaJSON::skip_whitespace(input, pos);
    if (pos < input.size() && input[pos] == '[') pos++;
    vector<int> arg1 = ArenaJSON::parse_vector_int(input, pos);
    int res = solve(arg1);
    ArenaJSON::print(res);
    cout << endl;
    return 0;
}
""",
    "everyone-except-me": """
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string input, line;
    while (getline(cin, line)) input += line;
    if (input.empty()) return 0;
    size_t pos = 0;
    ArenaJSON::skip_whitespace(input, pos);
    if (pos < input.size() && input[pos] == '[') pos++;
    vector<int> arg1 = ArenaJSON::parse_vector_int(input, pos);
    vector<int> res = solve(arg1);
    ArenaJSON::print(res);
    cout << endl;
    return 0;
}
""",
    "best-continuous-streak": """
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string input, line;
    while (getline(cin, line)) input += line;
    if (input.empty()) return 0;
    size_t pos = 0;
    ArenaJSON::skip_whitespace(input, pos);
    if (pos < input.size() && input[pos] == '[') pos++;
    vector<int> arg1 = ArenaJSON::parse_vector_int(input, pos);
    int res = solve(arg1);
    ArenaJSON::print(res);
    cout << endl;
    return 0;
}
""",
    "repeat-detector": """
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string input, line;
    while (getline(cin, line)) input += line;
    if (input.empty()) return 0;
    size_t pos = 0;
    ArenaJSON::skip_whitespace(input, pos);
    if (pos < input.size() && input[pos] == '[') pos++;
    vector<int> arg1 = ArenaJSON::parse_vector_int(input, pos);
    bool res = solve(arg1);
    ArenaJSON::print(res);
    cout << endl;
    return 0;
}
""",
    "triple-balance": """
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string input, line;
    while (getline(cin, line)) input += line;
    if (input.empty()) return 0;
    size_t pos = 0;
    ArenaJSON::skip_whitespace(input, pos);
    if (pos < input.size() && input[pos] == '[') pos++;
    vector<int> arg1 = ArenaJSON::parse_vector_int(input, pos);
    vector<vector<int>> res = solve(arg1);
    ArenaJSON::print(res);
    cout << endl;
    return 0;
}
""",
    "letter-match": """
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string input, line;
    while (getline(cin, line)) input += line;
    if (input.empty()) return 0;
    size_t pos = 0;
    ArenaJSON::skip_whitespace(input, pos);
    if (pos < input.size() && input[pos] == '[') pos++;
    string arg1 = ArenaJSON::parse_string(input, pos);
    ArenaJSON::skip_whitespace(input, pos);
    if (pos < input.size() && input[pos] == ',') pos++;
    string arg2 = ArenaJSON::parse_string(input, pos);
    bool res = solve(arg1, arg2);
    ArenaJSON::print(res);
    cout << endl;
    return 0;
}
""",
    "island-counter": """
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string input, line;
    while (getline(cin, line)) input += line;
    if (input.empty()) return 0;
    size_t pos = 0;
    ArenaJSON::skip_whitespace(input, pos);
    if (pos < input.size() && input[pos] == '[') pos++;
    vector<vector<char>> arg1 = ArenaJSON::parse_vector_vector_char(input, pos);
    int res = solve(arg1);
    ArenaJSON::print(res);
    cout << endl;
    return 0;
}
""",
    "non-adjacent-loot": """
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string input, line;
    while (getline(cin, line)) input += line;
    if (input.empty()) return 0;
    size_t pos = 0;
    ArenaJSON::skip_whitespace(input, pos);
    if (pos < input.size() && input[pos] == '[') pos++;
    vector<int> arg1 = ArenaJSON::parse_vector_int(input, pos);
    int res = solve(arg1);
    ArenaJSON::print(res);
    cout << endl;
    return 0;
}
""",
    "merged-median": """
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string input, line;
    while (getline(cin, line)) input += line;
    if (input.empty()) return 0;
    size_t pos = 0;
    ArenaJSON::skip_whitespace(input, pos);
    if (pos < input.size() && input[pos] == '[') pos++;
    vector<int> arg1 = ArenaJSON::parse_vector_int(input, pos);
    ArenaJSON::skip_whitespace(input, pos);
    if (pos < input.size() && input[pos] == ',') pos++;
    vector<int> arg2 = ArenaJSON::parse_vector_int(input, pos);
    double res = solve(arg1, arg2);
    ArenaJSON::print(res);
    cout << endl;
    return 0;
}
"""
}

def get_cpp_wrapper(slug: str) -> str:
    main_code = CPP_MAINS.get(slug, """
int main() {
    return 0;
}
""")
    return CPP_HEADER_AND_PARSER + main_code


JAVA_HEADER = """import java.io.*;
import java.util.*;

// --- USER CODE START ---
{{USER_CODE}}
// --- USER CODE END ---

public class SolutionRunner {
    static class ArenaParser {
        static void skipWhitespace(String s, int[] pos) {
            while (pos[0] < s.length() && Character.isWhitespace(s.charAt(pos[0]))) {
                pos[0]++;
            }
        }

        static int parseInt(String s, int[] pos) {
            skipWhitespace(s, pos);
            int start = pos[0];
            if (pos[0] < s.length() && (s.charAt(pos[0]) == '-' || s.charAt(pos[0]) == '+')) pos[0]++;
            while (pos[0] < s.length() && Character.isDigit(s.charAt(pos[0]))) pos[0]++;
            return Integer.parseInt(s.substring(start, pos[0]));
        }

        static double parseDouble(String s, int[] pos) {
            skipWhitespace(s, pos);
            int start = pos[0];
            if (pos[0] < s.length() && (s.charAt(pos[0]) == '-' || s.charAt(pos[0]) == '+')) pos[0]++;
            while (pos[0] < s.length() && (Character.isDigit(s.charAt(pos[0])) || s.charAt(pos[0]) == '.' || s.charAt(pos[0]) == 'e' || s.charAt(pos[0]) == 'E' || s.charAt(pos[0]) == '-' || s.charAt(pos[0]) == '+')) {
                if ((s.charAt(pos[0]) == '-' || s.charAt(pos[0]) == '+') && pos[0] != start && s.charAt(pos[0]-1) != 'e' && s.charAt(pos[0]-1) != 'E') break;
                pos[0]++;
            }
            return Double.parseDouble(s.substring(start, pos[0]));
        }

        static boolean parseBoolean(String s, int[] pos) {
            skipWhitespace(s, pos);
            if (pos[0] + 4 <= s.length() && s.substring(pos[0], pos[0] + 4).equals("true")) {
                pos[0] += 4;
                return true;
            }
            if (pos[0] + 5 <= s.length() && s.substring(pos[0], pos[0] + 5).equals("false")) {
                pos[0] += 5;
                return false;
            }
            return false;
        }

        static String parseString(String s, int[] pos) {
            skipWhitespace(s, pos);
            if (pos[0] >= s.length() || s.charAt(pos[0]) != '"') return "";
            pos[0]++;
            StringBuilder sb = new StringBuilder();
            while (pos[0] < s.length() && s.charAt(pos[0]) != '"') {
                if (s.charAt(pos[0]) == '\\\\' && pos[0] + 1 < s.length()) {
                    pos[0]++;
                    char next = s.charAt(pos[0]);
                    if (next == 'n') sb.append('\\n');
                    else if (next == 't') sb.append('\\t');
                    else if (next == '"') sb.append('"');
                    else if (next == '\\\\') sb.append('\\\\');
                    else sb.append(next);
                } else {
                    sb.append(s.charAt(pos[0]));
                }
                pos[0]++;
            }
            if (pos[0] < s.length() && s.charAt(pos[0]) == '"') pos[0]++;
            return sb.toString();
        }

        static int[] parseIntArray(String s, int[] pos) {
            skipWhitespace(s, pos);
            if (pos[0] >= s.length() || s.charAt(pos[0]) != '[') return new int[0];
            pos[0]++;
            skipWhitespace(s, pos);
            if (pos[0] < s.length() && s.charAt(pos[0]) == ']') {
                pos[0]++;
                return new int[0];
            }
            List<Integer> list = new ArrayList<>();
            while (pos[0] < s.length()) {
                skipWhitespace(s, pos);
                list.add(parseInt(s, pos));
                skipWhitespace(s, pos);
                if (pos[0] < s.length() && s.charAt(pos[0]) == ',') {
                    pos[0]++;
                } else if (pos[0] < s.length() && s.charAt(pos[0]) == ']') {
                    pos[0]++;
                    break;
                }
            }
            int[] res = new int[list.size()];
            for (int i = 0; i < list.size(); i++) res[i] = list.get(i);
            return res;
        }

        static List<String> parseStringList(String s, int[] pos) {
            skipWhitespace(s, pos);
            List<String> list = new ArrayList<>();
            if (pos[0] >= s.length() || s.charAt(pos[0]) != '[') return list;
            pos[0]++;
            skipWhitespace(s, pos);
            if (pos[0] < s.length() && s.charAt(pos[0]) == ']') {
                pos[0]++;
                return list;
            }
            while (pos[0] < s.length()) {
                skipWhitespace(s, pos);
                list.add(parseString(s, pos));
                skipWhitespace(s, pos);
                if (pos[0] < s.length() && s.charAt(pos[0]) == ',') {
                    pos[0]++;
                } else if (pos[0] < s.length() && s.charAt(pos[0]) == ']') {
                    pos[0]++;
                    break;
                }
            }
            return list;
        }

        static char[][] parseChar2DArray(String s, int[] pos) {
            skipWhitespace(s, pos);
            if (pos[0] >= s.length() || s.charAt(pos[0]) != '[') return new char[0][0];
            pos[0]++;
            skipWhitespace(s, pos);
            if (pos[0] < s.length() && s.charAt(pos[0]) == ']') {
                pos[0]++;
                return new char[0][0];
            }
            List<char[]> rows = new ArrayList<>();
            while (pos[0] < s.length()) {
                skipWhitespace(s, pos);
                List<String> rowStr = parseStringList(s, pos);
                char[] row = new char[rowStr.size()];
                for (int i = 0; i < rowStr.size(); i++) {
                    String str = rowStr.get(i);
                    row[i] = str.isEmpty() ? '0' : str.charAt(0);
                }
                rows.add(row);
                skipWhitespace(s, pos);
                if (pos[0] < s.length() && s.charAt(pos[0]) == ',') {
                    pos[0]++;
                } else if (pos[0] < s.length() && s.charAt(pos[0]) == ']') {
                    pos[0]++;
                    break;
                }
            }
            char[][] res = new char[rows.size()][];
            for (int i = 0; i < rows.size(); i++) res[i] = rows.get(i);
            return res;
        }

        static String serialize(int val) { return String.valueOf(val); }
        static String serialize(double val) {
            if (val == (long)val) return String.format(Locale.US, "%.1f", val);
            return String.valueOf(val);
        }
        static String serialize(boolean val) { return val ? "true" : "false"; }
        static String serialize(int[] arr) {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(arr[i]);
            }
            sb.append("]");
            return sb.toString();
        }
        static String serialize(List<List<Integer>> list) {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append("[");
                List<Integer> sub = list.get(i);
                for (int j = 0; j < sub.size(); j++) {
                    if (j > 0) sb.append(",");
                    sb.append(sub.get(j));
                }
                sb.append("]");
            }
            sb.append("]");
            return sb.toString();
        }
    }
"""

JAVA_MAINS = {
    "signal-pair": """
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) sb.append(line);
        String input = sb.toString().trim();
        if (input.isEmpty()) return;
        int[] pos = new int[]{0};
        ArenaParser.skipWhitespace(input, pos);
        if (pos[0] < input.length() && input.charAt(pos[0]) == '[') pos[0]++;
        int[] arg1 = ArenaParser.parseIntArray(input, pos);
        ArenaParser.skipWhitespace(input, pos);
        if (pos[0] < input.length() && input.charAt(pos[0]) == ',') pos[0]++;
        int arg2 = ArenaParser.parseInt(input, pos);
        Solution sol = new Solution();
        int[] res = sol.solve(arg1, arg2);
        System.out.println(ArenaParser.serialize(res));
    }
}
""",
    "best-trade-window": """
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) sb.append(line);
        String input = sb.toString().trim();
        if (input.isEmpty()) return;
        int[] pos = new int[]{0};
        ArenaParser.skipWhitespace(input, pos);
        if (pos[0] < input.length() && input.charAt(pos[0]) == '[') pos[0]++;
        int[] arg1 = ArenaParser.parseIntArray(input, pos);
        Solution sol = new Solution();
        int res = sol.solve(arg1);
        System.out.println(ArenaParser.serialize(res));
    }
}
""",
    "everyone-except-me": """
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) sb.append(line);
        String input = sb.toString().trim();
        if (input.isEmpty()) return;
        int[] pos = new int[]{0};
        ArenaParser.skipWhitespace(input, pos);
        if (pos[0] < input.length() && input.charAt(pos[0]) == '[') pos[0]++;
        int[] arg1 = ArenaParser.parseIntArray(input, pos);
        Solution sol = new Solution();
        int[] res = sol.solve(arg1);
        System.out.println(ArenaParser.serialize(res));
    }
}
""",
    "best-continuous-streak": """
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) sb.append(line);
        String input = sb.toString().trim();
        if (input.isEmpty()) return;
        int[] pos = new int[]{0};
        ArenaParser.skipWhitespace(input, pos);
        if (pos[0] < input.length() && input.charAt(pos[0]) == '[') pos[0]++;
        int[] arg1 = ArenaParser.parseIntArray(input, pos);
        Solution sol = new Solution();
        int res = sol.solve(arg1);
        System.out.println(ArenaParser.serialize(res));
    }
}
""",
    "repeat-detector": """
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) sb.append(line);
        String input = sb.toString().trim();
        if (input.isEmpty()) return;
        int[] pos = new int[]{0};
        ArenaParser.skipWhitespace(input, pos);
        if (pos[0] < input.length() && input.charAt(pos[0]) == '[') pos[0]++;
        int[] arg1 = ArenaParser.parseIntArray(input, pos);
        Solution sol = new Solution();
        boolean res = sol.solve(arg1);
        System.out.println(ArenaParser.serialize(res));
    }
}
""",
    "triple-balance": """
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) sb.append(line);
        String input = sb.toString().trim();
        if (input.isEmpty()) return;
        int[] pos = new int[]{0};
        ArenaParser.skipWhitespace(input, pos);
        if (pos[0] < input.length() && input.charAt(pos[0]) == '[') pos[0]++;
        int[] arg1 = ArenaParser.parseIntArray(input, pos);
        Solution sol = new Solution();
        List<List<Integer>> res = sol.solve(arg1);
        System.out.println(ArenaParser.serialize(res));
    }
}
""",
    "letter-match": """
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) sb.append(line);
        String input = sb.toString().trim();
        if (input.isEmpty()) return;
        int[] pos = new int[]{0};
        ArenaParser.skipWhitespace(input, pos);
        if (pos[0] < input.length() && input.charAt(pos[0]) == '[') pos[0]++;
        String arg1 = ArenaParser.parseString(input, pos);
        ArenaParser.skipWhitespace(input, pos);
        if (pos[0] < input.length() && input.charAt(pos[0]) == ',') pos[0]++;
        String arg2 = ArenaParser.parseString(input, pos);
        Solution sol = new Solution();
        boolean res = sol.solve(arg1, arg2);
        System.out.println(ArenaParser.serialize(res));
    }
}
""",
    "island-counter": """
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) sb.append(line);
        String input = sb.toString().trim();
        if (input.isEmpty()) return;
        int[] pos = new int[]{0};
        ArenaParser.skipWhitespace(input, pos);
        if (pos[0] < input.length() && input.charAt(pos[0]) == '[') pos[0]++;
        char[][] arg1 = ArenaParser.parseChar2DArray(input, pos);
        Solution sol = new Solution();
        int res = sol.solve(arg1);
        System.out.println(ArenaParser.serialize(res));
    }
}
""",
    "non-adjacent-loot": """
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) sb.append(line);
        String input = sb.toString().trim();
        if (input.isEmpty()) return;
        int[] pos = new int[]{0};
        ArenaParser.skipWhitespace(input, pos);
        if (pos[0] < input.length() && input.charAt(pos[0]) == '[') pos[0]++;
        int[] arg1 = ArenaParser.parseIntArray(input, pos);
        Solution sol = new Solution();
        int res = sol.solve(arg1);
        System.out.println(ArenaParser.serialize(res));
    }
}
""",
    "merged-median": """
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) sb.append(line);
        String input = sb.toString().trim();
        if (input.isEmpty()) return;
        int[] pos = new int[]{0};
        ArenaParser.skipWhitespace(input, pos);
        if (pos[0] < input.length() && input.charAt(pos[0]) == '[') pos[0]++;
        int[] arg1 = ArenaParser.parseIntArray(input, pos);
        ArenaParser.skipWhitespace(input, pos);
        if (pos[0] < input.length() && input.charAt(pos[0]) == ',') pos[0]++;
        int[] arg2 = ArenaParser.parseIntArray(input, pos);
        Solution sol = new Solution();
        double res = sol.solve(arg1, arg2);
        System.out.println(ArenaParser.serialize(res));
    }
}
"""
}

def get_java_wrapper(slug: str) -> str:
    main_code = JAVA_MAINS.get(slug, """
    public static void main(String[] args) {
    }
}
""")
    return JAVA_HEADER + main_code
