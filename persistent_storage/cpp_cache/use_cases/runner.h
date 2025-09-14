#ifndef COMMAND_LINE_PARSER_INCLUDED
#define COMMAND_LINE_PARSER_INCLUDED
#include "classes/command_line_parser.h"
#endif

#ifndef INPUT_PARSER_INCLUDED
#define INPUT_PARSER_INCLUDED
#include "classes/input_parser.h"
#endif

#ifndef IO_INCLUDED
#define IO_INCLUDED
#include "classes/io.h"
#endif

#ifndef CACHE_INCLUDED
#define CACHE_INCLUDED
#include "try_save_and_return_result.h"
#endif

#include <iostream>
#include <string>

class Runner
{
private:
    CommandLineParser *command_line_parser;
    InputParser *input_parser;
    IO *io;
    TrySaveAndReturnResult *cache;

    void deal_with_existing_input(Command &command, std::string &output, TrySaveAndReturnResult &cache)
    {
        CacheResult result{};
        result.second = "The command could not be processed.";
        if (command.command == std::string{"create"})
        {
            result = cache.create(command.id, command.value);
        }
        else if (command.command == std::string{"read"})
        {
            result = cache.read(command.id);
        }
        else if (command.command == std::string{"delete"})
        {
            result = cache.del(command.id);
        }
        if (!result.first)
        {
            output = "Error: " + result.second;
        }
        else
        {
            output = result.second == "" ? "Success!" : result.second;
        }
    }

public:
    Runner(CommandLineParser *clp,
           InputParser *ip,
           IO *io,
           TrySaveAndReturnResult *cache) : command_line_parser{clp}, input_parser{ip}, io{io}, cache{cache} {}

    Runner(const Runner &runner) : command_line_parser{runner.command_line_parser}, input_parser{runner.input_parser}, io{runner.io}, cache{runner.cache}
    {
    }

    Runner &operator=(const Runner &runner)
    {
        command_line_parser = runner.command_line_parser;
        input_parser = runner.input_parser;
        io = runner.io;
        cache = runner.cache;
        return *this;
    }

    ~Runner()
    {
        delete command_line_parser;
        delete input_parser;
        delete io;
        delete cache;
    }

    void parse_command_line_args(const int argument_count, const char *arguments[], CommandLineArguments &output)
    {
        command_line_parser->parse(argument_count, arguments, output);
    }

    // Command is used internally. It should not be used by the caller; however, it should be instantiated by the caller. Output will be reset.
    void process_command(std::string &buffer, Command &command, std::string &output)
    {
        output = "";
        if (buffer.find("quit") != std::string::npos || buffer.find("q") != std::string::npos)
            return;

        input_parser->parse_input(buffer, command);

        // Bad input, write error message to output
        if (!command.exists)
        {
            output.append(command.command.append("\n"));
            return;
        }

        // Get response from helper and write to output
        std::string cache_process_command_response{};
        deal_with_existing_input(command, cache_process_command_response, *cache);
        output.append(cache_process_command_response.c_str());
    }

    void run(const int argument_count, const char *arguments[])
    {
        // Get the command line arguments
        CommandLineArguments settings{};
        parse_command_line_args(argument_count, arguments, settings);

        // Allow io to decide where output is going, then create streams from those buffers
        std::streambuf *source{};
        std::streambuf *sink{};

        io->construct_istream(source);
        io->construct_ostream(sink);

        std::istream input{source};
        std::ostream output{sink};

        // Getline until eof
        std::string buffer{};
        std::string to_write_to_output{};
        std::string cmd{""};
        std::string id{""};
        std::string val{""};
        Command command{cmd, id, val};

        while (!input.eof())
        {
            std::getline(input, buffer);

            if (buffer.find("quit") != std::string::npos || buffer.find("q") != std::string::npos)
                break;

            process_command(buffer, command, to_write_to_output);

            output.write(to_write_to_output.c_str(), to_write_to_output.size());
        }
    }
};
