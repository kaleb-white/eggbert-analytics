#ifndef STRING_UTILS_INCLUDED
#include "utils/string_utils.h"
#define STRING_UTILS_INCLUDED
#endif

#include "input_parser_impl.h"

void InputParserImpl::reset_command(Command &cmd)
{
    cmd.command = "";
    cmd.exists = false;
    cmd.id = "";
    cmd.value = "";
}

bool InputParserImpl::check_num_arguments_for_create(std::vector<std::string> &commands, std::string &output)
{
    std::string joined_commands{};
    utils::join_string(commands, joined_commands);
    if (commands.size() < 3)
    {
        output = "Create commands are in the format create id value. You entered: " + joined_commands + " which contained " + std::to_string(commands.size()) + " commands.";
        return false;
    }
    return true;
}

bool InputParserImpl::check_num_arguments_for_read(std::vector<std::string> &commands, std::string &output)
{
    std::string joined_commands{};
    utils::join_string(commands, joined_commands);
    if (commands.size() != 2)
    {
        output = "Read commands are in the format read id. You entered: " + joined_commands + " which contained " + std::to_string(commands.size()) + " commands.";
        return false;
    }
    return true;
}

bool InputParserImpl::check_num_arguments_for_delete(std::vector<std::string> &commands, std::string &output)
{
    std::string joined_commands{};
    utils::join_string(commands, joined_commands);
    if (commands.size() != 2)
    {
        output = "Delete commands are in the format delete id. You entered: " + joined_commands + " which contained " + std::to_string(commands.size()) + " commands.";
        return false;
    }
    return true;
}

// Resets command, and then parses according to the contents of param 'raw'. If a command is not found, output.exists will be set to false.
void InputParserImpl::parse_input(std::string &raw, Command &output)
{
    reset_command(output);

    std::vector<std::string> commands{};
    utils::split_string(raw, commands);

    if (commands.size() == 0 || commands.size() == 1)
    {
        std::string joined_commands{};
        utils::join_string(commands, joined_commands);
        output.command = "Commands are: create id value, read id, delete id. You entered: " + joined_commands + " which had length " + std::to_string(commands.size());
        return;
    }

    if (commands[0] == "create")
    {
        if (!check_num_arguments_for_create(commands, output.command))
            return;
        output.command = "create";
        output.exists = true;
        output.id = commands[1];

        std::vector<std::string> delimited_parts_of_value{commands.begin() + 2, commands.end()};
        utils::join_string(delimited_parts_of_value, output.value);
    }
    else if (commands[0] == "read")
    {
        if (!check_num_arguments_for_read(commands, output.command))
            return;
        output.command = "read";
        output.exists = true;
        output.id = commands[1];
    }
    else if (commands[0] == "delete")
    {
        if (!check_num_arguments_for_delete(commands, output.command))
            return;
        output.command = "delete";
        output.exists = true;
        output.id = commands[1];
    }
    else
    {
        std::string joined_commands{};
        utils::join_string(commands, joined_commands);
        output.command = "Expected either 'create', 'read', or 'delete' as the first command, found " + joined_commands;
    }
};
