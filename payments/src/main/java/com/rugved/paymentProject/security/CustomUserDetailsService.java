package com.rugved.paymentProject.security;

import com.rugved.paymentProject.model.User;
import com.rugved.paymentProject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Username not found with this Email :" + email));
        return UserPrincipal.create(user);
    }

    @Transactional
    public UserDetails loadUserbyId(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->new UsernameNotFoundException("User not found with this id " + id));

        return UserPrincipal.create(user);
    }
}
