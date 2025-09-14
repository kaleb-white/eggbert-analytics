#ifndef TYPE_ALIASES
#define TYPE_ALIASES
#include "type_aliases.h"
#endif

class InputParser

{
public:
    virtual void parse_input(std::string &raw, Command &output) = 0;
    virtual ~InputParser() = default;
};
