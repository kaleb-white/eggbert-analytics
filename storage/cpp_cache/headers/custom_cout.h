#include <iostream>
#include <string>

class CustomCout
{
public:
    virtual CustomCout &operator<<(const std::string &t) = 0;
    virtual ~CustomCout() = default;
};

class CustomCoutForProd : public CustomCout
{
public:
    CustomCoutForProd() {};

    CustomCout &operator<<(const std::string &t)
    {
        std::cout << "\x1B[92m[cache]\x1B[0m " << t << '\n';
        return *this;
    }
};

class CustomCoutForTesting : public CustomCout
{
public:
    std::string &result_store;

    CustomCoutForTesting(std::string &result_store) : result_store{result_store} {};

    CustomCout &operator<<(const std::string &t)
    {
        result_store = t;
        std::cout << "\x1B[35m[cache]\x1B[0m " << t << '\n';
        return *this;
    }
};
