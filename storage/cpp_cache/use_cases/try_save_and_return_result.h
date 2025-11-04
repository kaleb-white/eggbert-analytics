#ifndef LRU_INCLUDED
#define LRU_INCLUDED
#include "classes/lru.h"
#endif

#ifndef COMMAND_LINE_PARSER_INCLUDED
#define COMMAND_LINE_PARSER_INCLUDED
#include "classes/command_line_parser.h"
#endif

#include <unordered_map>
#include <vector>

class TrySaveAndReturnResult
{
private:
    LRU *lru;
    CommandLineArguments &args;
    std::unordered_map<std::string, std::string> *cache;

    size_t get_size()
    {
        return this->lru->get_size() + cache->size();
    }

    bool try_reduce_size()
    {
        try
        {
            std::vector<std::string> to_remove_from_cache{};
            lru->return_n_lru_ids_and_delete_them(args.NumberIdsToRemoveAtSizeLimit.value, to_remove_from_cache);
            for (auto &id : to_remove_from_cache)
            {
                cache->erase(id);
            }
        }
        catch (...)
        {
            return false;
        }
        return true;
    }

public:
    TrySaveAndReturnResult(LRU *lru, CommandLineArguments &args) : lru{lru}, args{args}, cache{new std::unordered_map<std::string, std::string>{}} {
                                                                   };
    TrySaveAndReturnResult(const TrySaveAndReturnResult &t) : lru{t.lru}, args{t.args}, cache{t.cache} {}

    TrySaveAndReturnResult &operator=(const TrySaveAndReturnResult &t)
    {
        lru = t.lru;
        args = t.args;
        cache = t.cache;
        return *this;
    }

    ~TrySaveAndReturnResult()
    {
        delete lru;
        delete cache;
    }

    // Returns {true, ""} on success, or {false, a custom failure error message} on failure
    CacheResult create(Id &id, std::string &value)
    {
        // Need to reduce size; keep around 90% of requested usage
        while (static_cast<size_t>(get_size() * 9 / 10) > args.MaxMemoryBytes.value)
        {
            if (!(try_reduce_size()))
                return {false, "Cache hit memory use limit (" + std::to_string(get_size()) + " / " + std::to_string(args.MaxMemoryBytes.value) + ") but failed to reduce size!"};
        }

        try
        {
            lru->id_was_created(id);
        }
        catch (...)
        {
            return {false, "LRU failed to save id " + id};
        }

        try
        {
            cache->insert_or_assign(id, value);
        }
        catch (...)
        {
            lru->id_was_deleted(id);
            return {false, "Cache failed to save id " + id};
        }

        return {true, ""};
    }

    // Returns {true, value} on success, or {false, a custom failure error message} on failure
    CacheResult read(Id &id)
    {
        try
        {
            lru->id_was_read(id);
        }
        catch (...)
        {
            return {false, "LRU failed to read id " + id};
        }

        try
        {
            return {true, cache->at(id)};
        }
        catch (std::out_of_range const &)
        {
            return {false, "Id not found in cache " + id};
        }
        catch (...)
        {
            return {false, "Cache errored while reading id " + id};
        }
        return {false, "Cache errored while reading id " + id};
    }

    // Returns {true, ""} on success, or {false, a custom failure error message} on failure
    CacheResult del(Id &id)
    {
        try
        {
            lru->id_was_deleted(id);
        }
        catch (...)
        {
            return {false, "LRU failed to delete " + id};
        }

        try
        {
            cache->erase(id);
        }
        catch (std::out_of_range const &)
        {
            lru->id_was_created(id);
            return {false, "Id not found in cache " + id};
        }
        catch (...)
        {
            lru->id_was_created(id);
            return {false, "Cache errored while reading id " + id};
        }

        return {true, ""};
    }
};
