#define DOCTEST_CONFIG_IMPLEMENT_WITH_MAIN
#define DOCTEST_CONFIG_SUPER_FAST_ASSERTS
#include "doctest/doctest.h"

#ifndef COMMAND_LINE_PARSER_INCLUDED
#define COMMAND_LINE_PARSER_INCLUDED
#include "classes/command_line_parser.h"
#endif

#include <string.h>

#include "command_line_parser_impl.h"

TEST_CASE("test parserImpl")
{
    SUBCASE("test instantiation")
    {
        CommandLineParserImpl *myCommandLineParser{new CommandLineParserImpl{new CustomCoutForProd{}}};
        delete myCommandLineParser;
    }

    std::string string_input_to_custom_cout{};
    CommandLineParserImpl *myCommandLineParser{new CommandLineParserImpl{new CustomCoutForTesting{string_input_to_custom_cout}}};
    CommandLineArguments myArgs{};
    CommandLineArguments defaultArgs{};

    SUBCASE("test parse single argument")
    {
        const char *args[]{{"abc"}};
        myCommandLineParser->parse(1, args, myArgs);

        CHECK(myArgs.MaxMemoryBytes.value == defaultArgs.MaxMemoryBytes.value);
    }

    SUBCASE("test parse changes argument")
    {
        const char *args[]{{"-v=1"}};
        myCommandLineParser->parse(1, args, myArgs);

        CHECK(myArgs.Verbose.value == 1);
        myArgs = CommandLineArguments{};
    }

    SUBCASE("test parse changes all arguments")
    {
        const char *args[]{{"-v=1"}, {"-max-memory=100"}};
        myCommandLineParser->parse(2, args, myArgs);

        CHECK(myArgs.Verbose.value == 1);
        CHECK(myArgs.MaxMemoryBytes.value == 100);
        myArgs = CommandLineArguments{};
    }

    SUBCASE("test parse changes argument dne")
    {
        const char *args[]{{"-adfhdf=1"}, {"-max-memory=100"}};
        myCommandLineParser->parse(2, args, myArgs);

        CHECK(myArgs.MaxMemoryBytes.value == 100);
        myArgs = CommandLineArguments{};
    }

    SUBCASE("test parse args but no values")
    {
        const char *args[]{{"-adfhdf="}, {"-max-memory="}};
        myCommandLineParser->parse(2, args, myArgs);

        CHECK(myArgs.Verbose.value == defaultArgs.Verbose.value);
        CHECK(myArgs.MaxMemoryBytes.value == defaultArgs.MaxMemoryBytes.value);
        myArgs = CommandLineArguments{};
    }

    SUBCASE("test output string no key found")
    {
        const char *args[]{{"max-mem"}};
        myCommandLineParser->parse(1, args, myArgs);

        CHECK(string_input_to_custom_cout == std::string{"No matching flag found for argument: max-mem"});
    }

    SUBCASE("test output string flag found is invalid ")
    {
        const char *args[]{{"-ur-mum=123"}};
        myCommandLineParser->parse(1, args, myArgs);

        CHECK(string_input_to_custom_cout == std::string{"Flag found is not a valid option: -ur-mum=123"});
    }

    SUBCASE("test output string matches expected")
    {
        const char *args[]{{"-max-memory="}};
        myCommandLineParser->parse(1, args, myArgs);

        CHECK(string_input_to_custom_cout == std::string{"Flag found and is an option, but value was not found: -max-memory="});
    }

    SUBCASE("test output string on invalid argument")
    {
        const char *args[]{{"-v=12nfh\0\ni3ihhhhf;"}};
        myCommandLineParser->parse(1, args, myArgs);

        CHECK(string_input_to_custom_cout == std::string{"Flag and value found, but value couldn't be converted to int: -v=12nfh\0\ni3ihhhhf;"});
    }

    delete myCommandLineParser;
}
