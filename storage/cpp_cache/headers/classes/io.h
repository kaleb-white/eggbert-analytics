#include <iostream>

class IO
{
public:
    virtual void construct_istream(std::streambuf *&source_to_read_from) = 0;
    virtual void construct_ostream(std::streambuf *&sink_to_write_to) = 0;
    virtual ~IO() = default;
};
