#ifndef STRING_UTILS_INCLUDED
#define STRING_UTILS_INCLUDED

#include <string>
#include <vector>
#include <iostream>
namespace utils
{
    // Credit to: https://stackoverflow.com/questions/5888022/split-string-by-single-spaces
    void split_string(std::string &raw, std::vector<std::string> &output, char delimiter = ' ', bool include_delimiter_in_output = false);
    void join_string(std::vector<std::string> &raw, std::string &output);

}

#endif
