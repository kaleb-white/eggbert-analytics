#include "string_utils.h"
#include <string>
#include <vector>

namespace utils
{
    // Credit to: https://stackoverflow.com/questions/5888022/split-string-by-single-spaces
    void split_string(std::string &raw, std::vector<std::string> &output, char delimiter, bool include_delimiter_in_output)
    {
        size_t next_delimiter = raw.find(delimiter, 0);
        size_t prev_delimiter = 0;

        while (next_delimiter != std::string::npos)
        {
            output.push_back(raw.substr(prev_delimiter, next_delimiter - prev_delimiter - (include_delimiter_in_output ? 1 : 0)));
            prev_delimiter = next_delimiter + 1;
            next_delimiter = raw.find(delimiter, prev_delimiter);
        }

        output.push_back(raw.substr(prev_delimiter));
    }

    void join_string(std::vector<std::string> &raw, std::string &output)
    {
        output = raw[0];
        for (size_t i{1}; i < raw.size(); ++i)
        {
            output = output + " ";
            output = output + raw[i];
        }
    }
}
