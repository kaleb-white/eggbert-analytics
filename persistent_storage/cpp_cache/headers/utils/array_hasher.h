#ifndef TYPE_ALIASES
#define TYPE_ALIASES
#include "type_aliases.h"
#endif

#include <utility>
#include <functional>
#include <array>

namespace std
{
    template <>
    struct hash<std::array<char, 200>>
    {
        // FNV-1 hash function: https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
        size_t operator()(const std::array<char, 200> &arr) const
        {
            size_t hash{14695981039346656037u};

            for (char byte : arr)
            {
                hash = static_cast<unsigned>(hash * 1099511628211);
                hash = hash ^ static_cast<size_t>(byte);
            }

            return hash;
        };
    };
};
