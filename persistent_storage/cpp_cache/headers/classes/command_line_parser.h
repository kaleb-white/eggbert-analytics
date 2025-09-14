#ifndef CONSTANTS
#define CONSTANTS
#include "args.h"
#endif

class CommandLineParser
{
public:
    virtual void parse(const int argument_count, const char *arguments[], CommandLineArguments &modify_and_return) = 0;
    virtual ~CommandLineParser() = default;
};
