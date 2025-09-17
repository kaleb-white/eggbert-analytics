#ifndef COMMAND_LINE_PARSER_INCLUDED
#define COMMAND_LINE_PARSER_INCLUDED
#include "classes/command_line_parser.h"
#endif

#ifndef STRING_UTILS_INCLUDED
#include "utils/string_utils.h"
#endif

#include <string.h>
#include "command_line_parser_impl.h"

bool CommandLineParserImpl::parse_for_help(int argument_count, const char *arguments[])
{
    // Look for help command
    for (int i{0}; i < argument_count; ++i)
    {
        if (!strcmp(arguments[i], "-h") || !strcmp(arguments[i], "-help"))
        {
            CommandLineArguments c{};
            c.help();
            return true;
        }
    }
    return false;
}

std::string CommandLineParserImpl::pull_flag_key(const std::string potential)
{
    auto flag_start = potential.find_first_of('-');
    if (flag_start == std::string::npos)
    {
        return "";
    }

    auto flag_end = potential.find_first_of('=');
    if (flag_end == std::string::npos)
    {
        return "";
    }

    if (flag_start >= flag_end)
    {
        return "";
    }

    // abc-vnnnb=
    // flag_start = 3
    // flag_end = 9
    // flag_start + 1 = 4
    // flag_end - 1 - flag_start = 9 - 1 - 3 = 5
    // vnnnb

    // -v=1
    // flag_start = 0
    // flag_start + 1 = 1
    // flag_end = 2
    // flag_end - 1 - flag_start = 1
    // v
    return potential.substr(flag_start + 1, flag_end - 1 - flag_start);
}

std::string CommandLineParserImpl::pull_flag_value(const std::string potential)
{
    auto value_start = potential.find_first_of("=");
    if (value_start == std::string::npos)
    {
        return "";
    }

    return potential.substr(value_start + 1);
}

void CommandLineParserImpl::parse(const int argument_count, const char *arguments[], CommandLineArguments &modify_and_return)
{
    if (parse_for_help(argument_count, arguments))
        return;

    std::string args_as_string{};

    for (int i{0}; i < argument_count; ++i)
    {
        args_as_string = std::string{arguments[i]};

        const std::string key = pull_flag_key(arguments[i]);
        if (key == "")
        {
            *printer << std::string{"No matching flag found for argument: "}.append(args_as_string);
            continue;
        }
        if (!modify_and_return.is_an_option(key))
        {
            *printer << std::string{"Flag found is not a valid option: "}.append(args_as_string);
            continue;
        }

        const std::string value = pull_flag_value(arguments[i]);
        if (value == "")
        {
            *printer << std::string{"Flag found and is an option, but value was not found: "}.append(args_as_string);
            continue;
        }

        int value_cast;
        // For some reason, std::invalid_argument is not thrown.
        // - Catch will be left because on other compilers or other machines it may be thrown.
        // - Pos is also checked to see if the length is correct.
        size_t pos = 0;
        try
        {
            value_cast = std::stoi(value, &pos);
        }
        catch (...)
        {
            *printer << std::string{"Flag and value found, but value couldn't be converted to int: "}.append(args_as_string);
            continue;
        }
        if (pos != value.size())
        {
            *printer << std::string{"Flag and value found, but value couldn't be converted to int: "}.append(args_as_string);
            continue;
        }

        modify_and_return.set_option(key, value_cast);
    }
}
