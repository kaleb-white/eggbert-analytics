#ifndef TYPE_ALIASES
#define TYPE_ALIASES
#include "type_aliases.h"
#endif

#include <vector>

struct LinkedId
{
    const Id id;
    LinkedId *next;
    LinkedId *prev;

    LinkedId(const Id &id)
        : id{id}, next{nullptr}, prev{nullptr} {};

    LinkedId(const LinkedId &linked_id)
        : id{linked_id.id}, next{linked_id.next}, prev{linked_id.prev}
    {
    }

    LinkedId &operator=(const LinkedId &)
    {
        throw std::string("Assignment operator should not be used on LinkedIds!");
    }
};

class LRU
{
public:
    virtual size_t get_size() = 0;
    virtual void id_was_created(const Id &id) = 0;
    virtual void id_was_read(const Id &id) = 0;
    virtual void id_was_deleted(const Id &id) = 0;
    virtual size_t delete_n_ids(const Id &start_id, size_t n) = 0;
    virtual void least_recently_used(Id &output) = 0;
    virtual void least_recently_used_n(int n, std::vector<Id> &array_to_save_result_to) = 0;
    virtual void return_n_lru_ids_and_delete_them(size_t n, std::vector<Id> &array_to_save_result_to) = 0;
    virtual ~LRU() = default;
};
