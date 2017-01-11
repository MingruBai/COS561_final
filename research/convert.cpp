#include <iostream>
#include <cstdio>
using namespace std;

int main() {
    char s[1111];
    int a, b, c, d, tag = 0;
    double x, y;
    while(scanf("%d.%d.%d.%d,%lf,%lf", &a, &b, &c, &d, &x, &y) != -1) {
        if(!tag) 
            tag = 1;
        else 
            printf(",");
        printf("%lf,%lf", x, y);
    }
    
    return 0;
}
