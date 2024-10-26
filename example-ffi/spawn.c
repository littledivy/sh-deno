#include <stdlib.h>

static void __attribute__((constructor))
initialize(void) 
{
  system("/bin/ls");
}
