#include <string>
#define MAX_USERS 100

namespace sample {

using UserId = int;

enum class Status {
    STATUS_ACTIVE,
    STATUS_DISABLED,
};

/* A generic value container. */
template <typename T>
class Box {
public:
    explicit Box(T value) : value_(value) {}
    ~Box() = default;

    T get() const {
        return value_;
    }

    bool operator==(const Box& other) const {
        return value_ == other.value_;
    }

private:
    T value_;
};

/* Identity for generic values. */
template <typename T>
T identity(T value) {
    return value;
}

/* Add two integers. */
int add(int a, int b);
int add(int a, int b) {
    return a + b;
}

}  // namespace sample
