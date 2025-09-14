#ifndef CUSTOM_COUT_INCLUDED
#define CUSTOM_COUT_INCLUDED
#include "custom_cout.h"
#endif

#ifndef TYPE_ALIASES
#define TYPE_ALIASES
#include "type_aliases.h"
#endif

#include <string>
#include <vector>
#include <array>
#include <iostream>

#include <ws2tcpip.h>

struct CommandLineArguments
{
public:
    // Default 100 MB
    CommandLineArgument MaxMemoryBytes{"Max Memory in Bytes", "max-memory", 1000000000, 1000000000, "The max allowable memory in bytes for the cache to use. Defaults to 100Mb."};
    // 1 for true
    CommandLineArgument Verbose{
        "Verbose",
        "v",
        0,
        0,
        "When set, prints additional information while the program is running."};
    // Default 1037
    CommandLineArgument Port{
        "Port",
        "port",
        1037,
        1037,
        "The port to bind to."};
    // Number of backlog connections to accept when working with a port
    CommandLineArgument BacklogSize{
        "Backlog Size",
        "backlog-size",
        SOMAXCONN,
        SOMAXCONN,
        "The number of connections to allow in a backlong."};
    // Amount to buffer from port sender
    CommandLineArgument MaximumInputSizeBytes{
        "Maximum Input Size in Bytes",
        "max-input-size-bytes",
        20000,
        20000,
        "The max number of bytes to buffer from the client."};
    // Number of ids to delete at a time when mem limits are reached (not currently changeable)
    CommandLineArgument NumberIdsToRemoveAtSizeLimit{
        "Number of Ids To Remove At Size Limit",
        "delete-on-mem-limit-reach",
        5,
        5,
        "When the max limit size is reached, the cache will delete ids until it reaches below the max memory size. The increment it goes at is described by NumberIdsToRemoveAtSizeLimit."};

    std::array<CommandLineArgument *, 6> all_arguments{&MaxMemoryBytes, &Verbose, &Port, &BacklogSize, &MaximumInputSizeBytes, &NumberIdsToRemoveAtSizeLimit};

    void set_option(std::string option, int value)
    {
        for (auto &possible_option : all_arguments)
        {
            if ((*possible_option).argument == option)
            {
                (*possible_option).value = value;
            }
        }
    }

    bool is_an_option(const std::string potential)
    {
        for (auto &possible_option : all_arguments)
        {
            if ((*possible_option).argument == potential)
                return true;
        }
        return false;
    }

    void help()
    {
        CustomCout *cout{new CustomCoutForProd};
        std::string dash{"-"};

        *cout << "Available command line arguments:";

        for (auto &possible_option : all_arguments)
        {
            print_option((*possible_option).name, dash + (*possible_option).argument, (*possible_option).help_message, std::to_string((*possible_option).default_value));
        }

        *cout << "Use the style '-v=true' (for example), as opposed to '-v true'.";
        delete cout;
    }

    bool verbose()
    {
        return Verbose.value == 1;
    }

private:
    static void print_option(std::string option_name, std::string option_flag, std::string option_description, std::string option_default)
    {
        CustomCout *cout{new CustomCoutForProd{}};
        std::string output{"\t-name: "};
        output.append(option_name).append(", flag: ").append(option_flag).append(",  description: ").append(option_description).append(", default: ").append(option_default);
        *cout << output;
        delete cout;
    }
};
