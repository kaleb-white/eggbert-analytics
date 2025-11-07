#ifndef HEADERS_FOR_IO_INCLUDED
#define HEADERS_FOR_IO_INCLUDED

#ifndef RUNNER_INCLUDED
#define RUNNER_INCLUDED
#include "../../use_cases/runner.h"
#endif

#ifndef IO_AS_RUNNER_INCLUDED
#define IO_AS_RUNNER_INCLUDED
#include "../classes/io_as_runner.h"
#endif

#ifndef CUSTOM_COUT_INCLUDED
#define CUSTOM_COUT_INCLUDED
#include "../custom_cout.h"
#endif

#define STX 0x02
#define ETX 0x03
#define EOT 0x04
#define ETB 0x17
#define NAK 0x15

struct PeerCommunicationResult
{
    CommandLineArguments args{};
    bool was_sucessful{false};
    std::string failure_message{""};

    void reset()
    {
        was_sucessful = true;
        failure_message = "";
    }

    void print_if_verbose(CustomCout *&printer)
    {
        if (args.verbose())
        {
            *printer << failure_message;
        }
    }

    void set_failure(std::string new_failure_message, CustomCout *&printer)
    {
        was_sucessful = false;
        failure_message = new_failure_message;
        print_if_verbose(printer);
    }
};

#endif
