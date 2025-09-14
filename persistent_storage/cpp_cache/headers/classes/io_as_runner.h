class IOAsRunner
{
public:
    virtual void run(int argument_count, const char **arguments) = 0;
    virtual ~IOAsRunner() = default;
};
