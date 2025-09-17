#define DOCTEST_CONFIG_IMPLEMENT_WITH_MAIN
#define DOCTEST_CONFIG_SUPER_FAST_ASSERTS
#include "doctest/doctest.h"

#ifndef INPUT_PARSER_IMPL_INCLUDED
#define INPUT_PARSER_IMPL_INCLUDED
#include "input_parser_impl.h"
#endif

TEST_CASE("test input_parser_impl.cpp")
{
    SUBCASE("test instantiation")
    {
        InputParser *myInputParser{new InputParserImpl{}};
        delete myInputParser;
    }

    std::string empty_string1{""};
    std::string empty_string2{""};
    std::string empty_string3{""};
    Command output{empty_string1, empty_string2, empty_string3};
    InputParser *myInputParser{new InputParserImpl{}};

    SUBCASE("test no commands")
    {
        std::string input{""};
        myInputParser->parse_input(input, output);

        std::string expected_output{std::string{"Commands are: create id value, read id, delete id. You entered: "}.append("").append(" which had length 1")};
        CHECK(output.command == expected_output);
    }

    SUBCASE("test random command")
    {
        std::string input{"starfish 2"};
        myInputParser->parse_input(input, output);

        std::string expected_output{std::string{"Expected either 'create', 'read', or 'delete' as the first command, found "}.append(input)};
        CHECK(output.command == expected_output);
    }

    SUBCASE("test create wrong number of commands")
    {
        std::string input{"create id abcd efg"};
        myInputParser->parse_input(input, output);

        std::string expected_output{std::string{"Create commands are in the format create id value. You entered: "}.append(input).append(" which contained ").append("4") + " commands."};
        CHECK(output.command == expected_output);
    }

    SUBCASE("test read wrong number of commands")
    {
        std::string input{"read an g"};
        myInputParser->parse_input(input, output);

        std::string expected_output{std::string{"Read commands are in the format read id. You entered: "}.append(input).append(" which contained ").append("3") + " commands."};
        CHECK(output.command == expected_output);
    }

    SUBCASE("test delete wrong number of commands")
    {
        std::string input{"delete an g"};
        myInputParser->parse_input(input, output);

        std::string expected_output{std::string{"Delete commands are in the format delete id. You entered: "}.append(input).append(" which contained ").append("3") + " commands."};
        CHECK(output.command == expected_output);
    }

    SUBCASE("test create success")
    {
        std::string input{"create id abc"};
        myInputParser->parse_input(input, output);

        std::string expected_command{"create"};
        std::string expected_id{"id"};
        std::string expected_value{"abc"};
        CHECK(output.exists);
        CHECK(output.command == expected_command);
        CHECK(output.id == expected_id);
        CHECK(output.value == expected_value);
    }

    SUBCASE("test read success")
    {
        std::string input{"read id"};
        myInputParser->parse_input(input, output);

        std::string expected_command{"read"};
        std::string expected_id{"id"};
        std::string expected_value{""};
        CHECK(output.exists);
        CHECK(output.command == expected_command);
        CHECK(output.id == expected_id);
        CHECK(output.value == expected_value);
    }

    SUBCASE("test delete success")
    {
        std::string input{"delete id"};
        myInputParser->parse_input(input, output);

        std::string expected_command{"delete"};
        std::string expected_id{"id"};
        std::string expected_value{""};
        CHECK(output.exists);
        CHECK(output.command == expected_command);
        CHECK(output.id == expected_id);
        CHECK(output.value == expected_value);
    }
}
