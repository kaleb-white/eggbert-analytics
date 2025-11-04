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
#include "use_cases/try_save_and_return_result.h"
#endif

#ifndef RUNNER_INCLUDED
#define RUNNER_INCLUDED
#include "use_cases/runner.h"
#endif

#include "io/cli.h"
#include "lru/lru_map_and_linked_list.h"
#include "input_parser/input_parser_impl.h"
#include "comand_line_parser/command_line_parser_impl.h"

#include <iostream>

/*
    On start (this behavior all delegated):
        - Try to allocate memory for the cache according to flags
        - Try to open a connection to a port according to the port number given

    Loop:
        - Check cache availability
            - If cache > PERCENT full, run LRU
        - Wait for input
        - On input, read line
        - Parse input
        - If command is read, return the value in the map at the given id
        - If command is update, set the value in the map at the given id
        - If command is delete, delete the value in the map at the given id
        - Return success / failure of operation over port

    On exit:
        - Deallocate the memory for the cache
        - Close the port connection
*/

int main(const int argc, const char *argv[])
{
    IO *io = new CLI{};
    LRU *lru = new LruMapLinkedListImpl{};
    InputParser *ip = new InputParserImpl{};
    CustomCout *cout{new CustomCoutForProd{}};
    CommandLineParser *clp = new CommandLineParserImpl{cout};

    CommandLineArguments args{};

    TrySaveAndReturnResult *cache = new TrySaveAndReturnResult{lru, args};

    Runner *runner{new Runner{clp, ip, io, cache}};

    runner->run(argc - 1, argv + 1);

    delete runner;
}
