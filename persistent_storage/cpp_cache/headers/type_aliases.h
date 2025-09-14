#include <string>

// Type aliases (reference: https://www.learncpp.com/cpp-tutorial/typedefs-and-type-aliases/)
using Id = std::string;

struct CommandLineArgument
{
    std::string name;
    std::string argument;
    int value;
    int default_value;
    std::string help_message;
};

using CacheResult = std::pair<bool, std::string>;

struct Command
{
public:
    bool exists;
    std::string &command;
    Id &id;
    std::string &value;

    Command(std::string &command, std::string &id, std::string &value) : exists{false}, command{command}, id{id}, value{value}
    {
    }
};
