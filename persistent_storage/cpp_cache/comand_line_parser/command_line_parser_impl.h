#ifndef COMMAND_LINE_PARSER_INCLUDED
#define COMMAND_LINE_PARSER_INCLUDED
#include "classes/command_line_parser.h"
#endif

#include <iostream>
#include <string>
#include <string.h>

class CommandLineParserImpl : public CommandLineParser
{
private:
    CustomCout *printer;

    bool parse_for_help(int argument_count, const char *arguments[]);

    std::string pull_flag_key(const std::string potential);

    std::string pull_flag_value(const std::string potential);

public:
    CommandLineParserImpl(CustomCout *printer) : printer{printer} {}
    CommandLineParserImpl(const CommandLineParserImpl &clp) : printer{clp.printer} {}
    CommandLineParserImpl &operator=(const CommandLineParserImpl &clp)
    {
        printer = clp.printer;
        return *this;
    }
    ~CommandLineParserImpl()
    {
        delete printer;
    }

    void parse(const int argument_count, const char *arguments[], CommandLineArguments &modify_and_return);
};
