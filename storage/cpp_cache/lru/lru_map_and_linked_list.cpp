#include "lru_map_and_linked_list.h"

void LruMapLinkedListImpl::log_queue_start()
{
    std::cout << "queue start: " << &queue_start << '\n'
              << std::endl;
}

void LruMapLinkedListImpl::log_queue_start_next()
{
    std::cout << "queue start next: " << &queue_start->next << '\n'
              << std::endl;
}

std::string LruMapLinkedListImpl::print_linked_id(LinkedId *id)
{
    std::string output = "";
    output.append("Id: ").append(id->id).append(" -> ");
    return output;
}

void LruMapLinkedListImpl::restore_previous_queue_end()
{
    LinkedId *new_end = queue_end->prev;
    delete queue_end;
    queue_end = new_end;
}

void LruMapLinkedListImpl::restore_previous_queue_start()
{
    LinkedId *new_start = queue_start->next;
    delete queue_start;
    queue_start = new_start;
}

void LruMapLinkedListImpl::delete_linked_id_and_remove_pointers(LinkedId *linked_id)
{

    linked_id->next = nullptr;
    linked_id->prev = nullptr;
    delete linked_id;
    number_of_links--;
}

void LruMapLinkedListImpl::delete_id(LinkedId *id_addr)
{
    // Remove from position in linked list
    remove_id_from_queue_spot(id_addr);

    // Remove id from addr book
    address_finder->erase(id_addr->id);

    // Reassign pointers to nullptr and delete id_addr
    delete_linked_id_and_remove_pointers(id_addr);
}

void LruMapLinkedListImpl::remove_from_queue_middle(LinkedId *linked_id)
{
    linked_id->prev->next = linked_id->next;
    linked_id->next->prev = linked_id->prev;
}

void LruMapLinkedListImpl::remove_from_queue_start()
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

void LruMapLinkedListImpl::remove_from_queue_end()
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
void LruMapLinkedListImpl::remove_from_start_and_end()
{
    queue_end = nullptr;
    queue_start = nullptr;
}

void LruMapLinkedListImpl::remove_id_from_queue_spot(LinkedId *id)
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

void LruMapLinkedListImpl::add_id_to_queue_end(LinkedId *id)
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

void LruMapLinkedListImpl::traverse_n(LinkedId *start, const size_t n, std::vector<Id> &array_to_save_to)
{
    if (n == 0)
        return;
    array_to_save_to.insert(array_to_save_to.end(), start->id);
    for (size_t i{0}; i < n - 1; ++i)
    {
        start = start->next;
        if (start == nullptr)
            return;
        array_to_save_to.insert(array_to_save_to.end(), start->id);
    }
}

void LruMapLinkedListImpl::traverse_n_and_return_pointers(LinkedId *start, const size_t n, std::vector<LinkedId *> &array_to_save_to)
{
    if (n == 0)
        return;
    array_to_save_to.insert(array_to_save_to.end(), start);
    for (size_t i{0}; i < n - 1; ++i)
    {
        start = start->next;
        if (start == nullptr)
            return;
        array_to_save_to.insert(array_to_save_to.end(), start);
    }
}

size_t LruMapLinkedListImpl::get_size()
{
    return number_of_links * sizeof(LinkedId) + address_finder->size();
};

void LruMapLinkedListImpl::id_was_created(const Id &id)
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

void LruMapLinkedListImpl::id_was_read(const Id &id)
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

void LruMapLinkedListImpl::id_was_deleted(const Id &id)
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

size_t LruMapLinkedListImpl::delete_n_ids(const Id &start_id, size_t n)
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

void LruMapLinkedListImpl::least_recently_used(Id &output)
{
    const Id &no_queue_return_val{""};
    if (queue_start == nullptr)
        output = no_queue_return_val;
    output = queue_start->id;
}
void LruMapLinkedListImpl::least_recently_used_n(int n, std::vector<Id> &array_to_save_result_to)
{
    return traverse_n(queue_start, n, array_to_save_result_to);
}

void LruMapLinkedListImpl::return_n_lru_ids_and_delete_them(size_t n, std::vector<Id> &array_to_save_result_to)
{
    traverse_n(queue_start, n, array_to_save_result_to);

    const size_t num_deleted = delete_n_ids(queue_start->id, n);

    if (num_deleted != array_to_save_result_to.size())
    {
        throw new std::string{"The number of ids found was not equal to the number of ids deleted (calling traverse_n internally vs calling delete_n_ids)"};
    }
}

std::string LruMapLinkedListImpl::print_queue(short num_items)
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
