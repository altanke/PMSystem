package com.pmsystem.domain.model;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class RoleTest {

    @Test
    void testRoles() {
        Role[] roles = Role.values();
        assertThat(roles).isNotEmpty();
        
        Role admin = Role.valueOf("ADMIN");
        assertThat(admin).isEqualTo(Role.ADMIN);
    }
}
