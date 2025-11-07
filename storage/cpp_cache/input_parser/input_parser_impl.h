#ifndef INPUT_PARSER_INCLUDED
#define INPUT_PARSER_INCLUDED
#include "classes/input_parser.h"
#endif

#include <string>
#include <vector>

class InputParserImpl : public InputParser
{
private:
    void reset_command(Command &cmd);

    bool check_num_arguments_for_create(std::vector<std::string> &commands, std::string &output);

    bool check_num_arguments_for_read(std::vector<std::string> &commands, std::string &output);

    bool check_num_arguments_for_delete(std::vector<std::string> &commands, std::string &output);

public:
    void parse_input(std::string &raw, Command &output);
};
