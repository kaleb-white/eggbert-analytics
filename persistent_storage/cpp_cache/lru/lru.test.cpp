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

    void log_queue_start()
    {
        std::cout << "queue start: " << &queue_start << '\n'
                  << std::endl;
    }

    void log_queue_start_next()
    {
        std::cout << "queue start next: " << &queue_start->next << '\n'
                  << std::endl;
    }

    std::string print_linked_id(LinkedId *id)
    {
        std::string output = "";
        output.append("Id: ").append(id->id).append(" -> ");
        return output;
    }

    void restore_previous_queue_end()
    {
        LinkedId *new_end = queue_end->prev;
        delete queue_end;
        queue_end = new_end;
    }

    void restore_previous_queue_start()
    {
        LinkedId *new_start = queue_start->next;
        delete queue_start;
        queue_start = new_start;
    }

    void delete_linked_id_and_remove_pointers(LinkedId *linked_id)
    {

        linked_id->next = nullptr;
        linked_id->prev = nullptr;
        delete linked_id;
        number_of_links--;
    }

    void delete_id(LinkedId *id_addr)
    {
        // Remove from position in linked list
        remove_id_from_queue_spot(id_addr);

        // Remove id from addr book
        address_finder->erase(id_addr->id);

        // Reassign pointers to nullptr and delete id_addr
        delete_linked_id_and_remove_pointers(id_addr);
    }

    void remove_from_queue_middle(LinkedId *linked_id)
    {
        linked_id->prev->next = linked_id->next;
        linked_id->next->prev = linked_id->prev;
    }

    void remove_from_queue_start()
    {
        // If queue_start has a next link
        if (queue_start->next != nullptr)
        {
            queue_start->next->prev = nullptr;
            queue_start = queue_start->next;
        }
        // If it doesn't set it to nullptr
        else
        {
            queue_start = nullptr;
        }
    }

    void remove_from_queue_end()
    {
        // If queue_end has a next link
        if (queue_end->prev != nullptr)
        {
            queue_end->prev->next = nullptr;
            queue_end = queue_end->prev;
        }
        // If it doesn't set it to nullptr
        else
        {
            queue_end = nullptr;
        }
    }

    // If there's only one link
    void remove_from_start_and_end()
    {
        queue_end = nullptr;
        queue_start = nullptr;
    }

    void remove_id_from_queue_spot(LinkedId *id)
    {
        if (queue_end == queue_start)
        {
            remove_from_start_and_end();
        }
        else if (id == queue_start)
        {
            remove_from_queue_start();
        }
        else if (id == queue_end)
        {
            remove_from_queue_end();
        }
        else
        {
            remove_from_queue_middle(id);
        }
    }

    void add_id_to_queue_end(LinkedId *id)
    {
        // If there's no links
        if (queue_end == nullptr && queue_start == nullptr)
        {
            queue_end = id;
            queue_start = id;
            id->prev = nullptr;
            id->next = nullptr;
        }
        else
        {
            id->prev = queue_end;
            id->next = nullptr;
            queue_end->next = id;
            queue_end = id;
        }
    }

    void traverse_n(LinkedId *start, const short n, std::vector<Id> &array_to_save_to)
    {
        if (n == 0)
            return;
        array_to_save_to.insert(array_to_save_to.end(), start->id);
        for (int i{0}; i < n - 1; ++i)
        {
            start = start->next;
            if (start == nullptr)
                return;
            array_to_save_to.insert(array_to_save_to.end(), start->id);
        }
    }

    void traverse_n_and_return_pointers(LinkedId *start, const short n, std::vector<LinkedId *> &array_to_save_to)
    {
        if (n == 0)
            return;
        array_to_save_to.insert(array_to_save_to.end(), start);
        for (int i{0}; i < n - 1; ++i)
        {
            start = start->next;
            if (start == nullptr)
                return;
            array_to_save_to.insert(array_to_save_to.end(), start);
        }
    }

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
        this->queue_start = lru.queue_start;
        this->queue_end = lru.queue_end;
        this->address_finder = lru.address_finder;

        return *this;
    }

    size_t get_size()
    {
        return number_of_links * sizeof(LinkedId) + address_finder->size();
    };

    void id_was_created(const Id &id)
    {
        // Create new LinkedId and add links
        try
        {
            // Create new LinkedId
            LinkedId *new_end = new LinkedId{id};

            add_id_to_queue_end(new_end);
            number_of_links++;
        }
        catch (std::bad_alloc &bad_alloc)
        {
            std::cerr << "LRU failed to allocate more memory for a LinkedId struct";
            throw bad_alloc;
        };

        // Add {id, queue_end} to address finder
        try
        {
            address_finder->insert({queue_end->id, queue_end});
        }
        catch (...)
        {
            std::cerr << "Inserting to address finder failed. Id removed from end of queue";
            restore_previous_queue_end();
            throw "Error in id_was_created in LRU";
        };
    };

    void id_was_read(const Id &id)
    {
        // If no exception is thrown, an addr exists for this id
        try
        {
            LinkedId *id_addr = address_finder->at(id);
            remove_id_from_queue_spot(id_addr);
            add_id_to_queue_end(id_addr);
        }
        // If the key doesn't exist, expected behavior is to do nothing
        catch (std::out_of_range const &)
        {
        }
    };

    void id_was_deleted(const Id &id)
    {
        // If no exception is thrown, an addr exists for this id
        try
        {
            LinkedId *id_addr = address_finder->at(id);

            delete_id(id_addr);
        }
        // If the key doesn't exist, expected behavior is to do nothing
        catch (std::out_of_range const &)
        {
        }
    };

    size_t delete_n_ids(const Id &start_id, short n)
    {
        try
        {
            LinkedId *id_addr = address_finder->at(start_id);
            std::vector<LinkedId *> consecutive_links{};
            traverse_n_and_return_pointers(id_addr, n, consecutive_links);

            size_t number_of_ids_deleted = 0;
            for (auto &linked_id : consecutive_links)
            {
                delete_id(linked_id);
                ++number_of_ids_deleted;
            }

            return number_of_ids_deleted;
        }
        catch (std::out_of_range const &)
        {
            return 0;
        }
    }

    const Id &least_recently_used()
    {
        const Id &no_queue_return_val{""};
        if (queue_start == nullptr)
            return no_queue_return_val;
        return queue_start->id;
    }
    void least_recently_used_n(short n, std::vector<Id> &array_to_save_result_to)
    {
        return traverse_n(queue_start, n, array_to_save_result_to);
    }

    void return_n_lru_ids_and_delete_them(short n, std::vector<Id> &array_to_save_result_to)
    {
        traverse_n(queue_start, n, array_to_save_result_to);

        const size_t num_deleted = delete_n_ids(queue_start->id, n);

        if (num_deleted != array_to_save_result_to.size())
        {
            throw new std::string{"The number of ids found was not equal to the number of ids deleted (calling traverse_n internally vs calling delete_n_ids)"};
        }
    }

    std::string print_queue(short num_items = 10)
    {
        LinkedId *curr = queue_start;
        std::string output = "";
        if (curr == nullptr)
        {
            return "Queue empty!\n";
        }
        for (int i{0}; i < num_items; ++i)
        {
            output.append(print_linked_id(curr));
            curr = curr->next;
            if (curr == nullptr)
            {
                return output.append("END");
            }
        }

        return output;
    }
};

#define DOCTEST_CONFIG_IMPLEMENT_WITH_MAIN
#define DOCTEST_CONFIG_SUPER_FAST_ASSERTS
#include "doctest/doctest.h"

#ifndef LRU_INCLUDED
#define LRU_INCLUDED
#include "classes/lru.h"
#endif

#include <iostream>

TEST_CASE("testing lru map_and_linked_list")
{
    SUBCASE("testing instantiation")
    {
        LruMapLinkedListImpl myLru{LruMapLinkedListImpl{}};
    }

    SUBCASE("test size is 0 after instantiation")
    {
        LruMapLinkedListImpl myLru{LruMapLinkedListImpl{}};
        CHECK(myLru.get_size() == 0);
    }

    SUBCASE("test one id was created")
    {
        LruMapLinkedListImpl myLru{LruMapLinkedListImpl{}};
        const Id &id{"abcd"}; // Total length four with trailing \0

        myLru.id_was_created(id);

        REQUIRE(myLru.least_recently_used() == "abcd");
    }

    SUBCASE("test multiple id's created")
    {
        LruMapLinkedListImpl myLru{LruMapLinkedListImpl{}};
        const Id &id1{"abcd"};
        const Id &id2("abcde");

        myLru.id_was_created(id1);
        auto old_size = myLru.get_size();

        myLru.id_was_created(id2);
        auto new_size = myLru.get_size();

        REQUIRE(myLru.least_recently_used() == "abcd");
        REQUIRE(new_size > old_size);
    }

    SUBCASE("test read id at start")
    {
        LruMapLinkedListImpl myLru{LruMapLinkedListImpl{}};
        const Id &id1{"abcd"};
        const Id &id2("abcde");

        myLru.id_was_created(id1);
        myLru.id_was_created(id2);

        myLru.id_was_read(id1);

        REQUIRE(myLru.least_recently_used() == "abcde");
    }

    SUBCASE("test read id in middle")
    {
        LruMapLinkedListImpl myLru{LruMapLinkedListImpl{}};
        const Id &id1{"a"};
        const Id &id2("ab");
        const Id &id3("abc");

        myLru.id_was_created(id1);
        myLru.id_was_created(id2);
        myLru.id_was_created(id3);

        myLru.id_was_read(id2); // Now id1 -> id3 -> id2
        myLru.id_was_read(id1); // Now id3 -> id2 -> id1
        myLru.id_was_read(id3); // Now id2 -> id1 -> id3

        REQUIRE(myLru.least_recently_used() == "ab");
        myLru.id_was_read(id2);
        REQUIRE(myLru.least_recently_used() == "a");
    }

    SUBCASE("test read id does not change size")
    {
        LruMapLinkedListImpl myLru{LruMapLinkedListImpl{}};
        const Id &id1{"a"};
        const Id &id2("ab");
        const Id &id3("abc");

        myLru.id_was_created(id1);
        myLru.id_was_created(id2);
        myLru.id_was_created(id3);

        auto old_size = myLru.get_size();

        myLru.id_was_read(id2); // Now id1 -> id3 -> id2
        myLru.id_was_read(id1); // Now id3 -> id2 -> id1
        myLru.id_was_read(id3); // Now id2 -> id1 -> id3

        auto new_size = myLru.get_size();
        CHECK(old_size == new_size);
    }

    SUBCASE("test read nonexistent id has no effet")
    {
        LruMapLinkedListImpl myLru{LruMapLinkedListImpl{}};
        const Id &id1{"a"};
        const Id &id2("ab");
        const Id &id3("abc");

        myLru.id_was_created(id1);
        myLru.id_was_created(id2);

        auto old_lru = myLru.least_recently_used();
        myLru.id_was_read(id3);
        auto new_lru = myLru.least_recently_used();

        CHECK(old_lru == new_lru);
    }

    LruMapLinkedListImpl myLru{LruMapLinkedListImpl{}};
    const Id &id1{"a"};
    const Id &id2("ab");
    const Id &id3("abc");

    SUBCASE("test delete single queue item")
    {
        myLru.id_was_created(id1);
        myLru.id_was_deleted(id1);

        REQUIRE(myLru.least_recently_used() == "");
    }

    SUBCASE("test delete queue start")
    {
        myLru.id_was_created(id1);
        myLru.id_was_created(id2);

        myLru.id_was_deleted(id1);

        REQUIRE(myLru.least_recently_used() == "ab");

        myLru.id_was_deleted(id2);
    }

    SUBCASE("test delete queue end")
    {
        myLru.id_was_created(id1);
        myLru.id_was_created(id2);

        myLru.id_was_deleted(id2);

        CHECK(myLru.print_queue() == "Id: a -> END");

        myLru.id_was_deleted(id1);
    }

    SUBCASE("test delete queue middle")
    {
        myLru.id_was_created(id1);
        myLru.id_was_created(id2);
        myLru.id_was_created(id3);

        myLru.id_was_deleted(id2);

        CHECK(myLru.print_queue() == "Id: a -> Id: abc -> END");

        myLru.id_was_deleted(id3);
        myLru.id_was_deleted(id1);
    }

    SUBCASE("check mem use")
    {
        auto initial_size = myLru.get_size();

        myLru.id_was_created(id1);
        myLru.id_was_created(id2);

        auto two_elts_size = myLru.get_size();

        myLru.id_was_created(id3);
        myLru.id_was_deleted(id3);

        auto elt_deleted = myLru.get_size();

        myLru.id_was_deleted(id2);
        myLru.id_was_deleted(id1);

        auto no_elts = myLru.get_size();

        const std::string mem_use{"\nInitial size: " + std::to_string(initial_size) + "\nWith two elements: " + std::to_string(two_elts_size) + "\nAfter deleting one: " + std::to_string(elt_deleted) + "\nAfter deleting all: " + std::to_string(no_elts)};
        MESSAGE(mem_use);
    }

    SUBCASE("check mem use with many elements")
    {
        auto initial_size = std::to_string(myLru.get_size());

        for (int i{0}; i < 1000; ++i)
        {
            const Id &id{std::string(i, 'a')};
            myLru.id_was_created(id);
        }

        auto with_elements = std::to_string(myLru.get_size());

        for (int i{0}; i < 1000; ++i)
        {
            const Id &id{std::string(i, 'a')};
            myLru.id_was_deleted(id);
        }

        auto elements_deleted = std::to_string(myLru.get_size());

        const std::string mem_use("\nInitial size: " + initial_size + "\nWith elements: " + with_elements + "\nAfter delete: " + elements_deleted);

        MESSAGE(mem_use);
        REQUIRE(myLru.get_size() == 0);
    }

    SUBCASE("test delete n ids")
    {
        int reps{2000};
        for (int i{0}; i < reps; ++i)
        {
            const Id &id{std::string(i, 'a')};
            myLru.id_was_created(id);
        }

        auto num_deleted = myLru.delete_n_ids(Id{""}, reps);

        REQUIRE(num_deleted == reps);
    }

    SUBCASE("delete no ids")
    {
        const Id &id{"a"};
        myLru.id_was_created(id);

        auto num_deleted = myLru.delete_n_ids("a", 0);

        REQUIRE(num_deleted == 0);

        myLru.id_was_deleted(id);
    }

    SUBCASE("test return n lru ids and delete them with one id")
    {
        myLru.id_was_created("a");
        std::vector<Id> arr{};

        myLru.return_n_lru_ids_and_delete_them(1, arr);

        CHECK(arr[0] == "a");
    }

    SUBCASE("test return n lru ids and delete them with more than num ids")
    {
        myLru.id_was_created("a");
        std::vector<Id> arr{};

        myLru.return_n_lru_ids_and_delete_them(2, arr);

        CHECK(arr.size() == 1);
    }
}
