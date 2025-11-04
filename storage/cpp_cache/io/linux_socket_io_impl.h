#ifndef HEADERS_FOR_IO_INCLUDED
#include "../headers/io/headers_for_io.h"
#define HEADERS_FOR_IO_INCLUDED
#endif

#include <sys/socket.h>

class LinuxSocketIoImpl : public IOAsRunner
{
    CustomCout *&printer;
    CommandLineArguments &args;
    Runner *&runner;

public:
    LinuxSocketIoImpl(CustomCout *&printer, CommandLineArguments &args, Runner *&runner) : printer{printer}, args{args}, runner{runner} {};
    ~LinuxSocketIoImpl() { delete printer; };
    LinuxSocketIoImpl(const LinuxSocketIoImpl &l) : printer{l.printer}, args{l.args}, runner{l.runner} {};
    LinuxSocketIoImpl &operator=(const LinuxSocketIoImpl &l)
    {
        delete this->printer;
        this->printer = l.printer;
        this->args = l.args;
        this->runner = l.runner;
        return *this;
    }

    void run(int argument_count, const char **arguments)
    {
        runner->parse_command_line_args(argument_count, arguments, args);
        if (args.verbose())
        {
            *printer << "Creating client and server sockets...";
        }
    };
};
