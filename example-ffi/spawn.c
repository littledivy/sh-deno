#include <stdlib.h>
#include <stdio.h>

static void __attribute__((constructor)) initialize(void) {
    system("/bin/ls");
}
