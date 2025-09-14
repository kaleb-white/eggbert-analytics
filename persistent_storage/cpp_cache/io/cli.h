#ifndef IO_INCLUDED
#define IO_INCLUDED
#include "classes/io.h"
#endif

#include <iostream>

class CLI : public IO
{
    void construct_istream(std::streambuf *&source_to_read_from)
    {
        source_to_read_from = std::cin.rdbuf();
    }
    void construct_ostream(std::streambuf *&sink_to_write_to)
    {
        sink_to_write_to = std::cout.rdbuf();
    }
};
