#ifndef LRU_INCLUDED
#define LRU_INCLUDED
#include "classes/lru.h"
#endif

#include <unordered_map>
#include <utility>
#include <string>
#include <vector>
#include <memory>
#include <iostream>

class LruMapLinkedListImpl : public LRU
{
private:
    LinkedId *queue_start;
    LinkedId *queue_end;
    std::unordered_map<Id, LinkedId *> *address_finder;
    size_t number_of_links = 0;

    void log_queue_start();
    void log_queue_start_next();
    std::string print_linked_id(LinkedId *id);
    void restore_previous_queue_end();
    void restore_previous_queue_start();
    void delete_linked_id_and_remove_pointers(LinkedId *linked_id);
    void delete_id(LinkedId *id_addr);
    void remove_from_queue_middle(LinkedId *linked_id);
    void remove_from_queue_start();
    void remove_from_queue_end();
    void remove_from_start_and_end();
    void remove_id_from_queue_spot(LinkedId *id);
    void add_id_to_queue_end(LinkedId *id);
    void traverse_n(LinkedId *start, const size_t n, std::vector<Id> &array_to_save_to);
    void traverse_n_and_return_pointers(LinkedId *start, const size_t n, std::vector<LinkedId *> &array_to_save_to);

public:
    LruMapLinkedListImpl()
        : queue_start{nullptr},
          queue_end{nullptr},
          address_finder{new std::unordered_map<Id, LinkedId *>()}
    {
    }

    ~LruMapLinkedListImpl()
    {
        // Delete the unordered_map
        delete address_finder;

        // Delete all linked list nodes to prevent memory leaks
        LinkedId *current = queue_start;
        while (current != nullptr)
        {
            LinkedId *next = current->next;
            delete current;
            current = next;
        }
    }

    LruMapLinkedListImpl(const LruMapLinkedListImpl &lru)
        : queue_start{lru.queue_start}, queue_end{lru.queue_end}, address_finder{lru.address_finder}
    {
    }

    LruMapLinkedListImpl &operator=(const LruMapLinkedListImpl &lru)
    {
        delete this->queue_end;
        delete this->queue_start;
        delete this->address_finder;
        this->queue_start = lru.queue_start;
        this->queue_end = lru.queue_end;
        this->address_finder = lru.address_finder;

        return *this;
    }

    size_t get_size();
    void id_was_created(const Id &id);
    void id_was_read(const Id &id);
    void id_was_deleted(const Id &id);
    size_t delete_n_ids(const Id &start_id, size_t n);
    void least_recently_used(Id &output);
    void least_recently_used_n(int n, std::vector<Id> &array_to_save_result_to);
    void return_n_lru_ids_and_delete_them(size_t n, std::vector<Id> &array_to_save_result_to);
    std::string print_queue(short num_items = 10);
};
