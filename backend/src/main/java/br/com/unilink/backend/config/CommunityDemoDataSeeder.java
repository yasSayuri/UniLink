package br.com.unilink.backend.config;

import br.com.unilink.backend.model.Community;
import br.com.unilink.backend.model.Post;
import br.com.unilink.backend.model.User;
import br.com.unilink.backend.repository.CommunityRepository;
import br.com.unilink.backend.repository.PostRepository;
import br.com.unilink.backend.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class CommunityDemoDataSeeder implements ApplicationRunner {

    private static final String CAMPUS = "Campo Mourão";
    private static final String INSTITUTION = "Universidade Tecnológica Federal do Paraná";
    private static final String DOMAIN = "utfpr.edu.br";

    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final PostRepository postRepository;
    private final PasswordEncoder passwordEncoder;

    public CommunityDemoDataSeeder(
            UserRepository userRepository,
            CommunityRepository communityRepository,
            PostRepository postRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.communityRepository = communityRepository;
        this.postRepository = postRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        List<User> users = List.of(
                seedUser("pessoa.fake.ana", "ana.souza", "Ana Souza", "Ciência da Computação", 4),
                seedUser("pessoa.fake.lucas", "lucas.ferreira", "Lucas Ferreira", "Engenharia Civil", 6),
                seedUser("pessoa.fake.marina", "marina.alves", "Marina Alves", "Engenharia de Alimentos", 3),
                seedUser("pessoa.fake.rafael", "rafael.lima", "Rafael Lima", "Engenharia Eletrônica", 5),
                seedUser("pessoa.fake.beatriz", "beatriz.costa", "Beatriz Costa", "Licenciatura em Química", 2));
        users.forEach(author -> postRepository.findAllByAuthorId(author.getId()).forEach(post -> {
            post.updateAuthorSnapshot(author);
            postRepository.save(post);
        }));

        List<CommunityPostSeed> posts = List.of(
                new CommunityPostSeed("Grupo de Estudos", "gente, alguém anima revisar algoritmos na biblioteca amanhã? #estudos", 0),
                new CommunityPostSeed("Engenharia de Computação", "sobrevivi à entrega do trabalho de programação 🙌", 0),
                new CommunityPostSeed("Vida Universitária UTFPR", "qual RU vocês acham melhor por aqui? aceito dicas kkk", 0),
                new CommunityPostSeed("Vida Universitária UTFPR", "primeira semana no campus e já me perdi duas vezes 😂", 1),
                new CommunityPostSeed("Moradia e Repúblicas", "alguém conhece uma república tranquila perto da UTFPR?", 1),
                new CommunityPostSeed("Grupo de Estudos", "fiz um resumão de cálculo, se alguém quiser trocar material me chama!", 1),
                new CommunityPostSeed("Moradia e Repúblicas", "achei uma kitnet legal mas dividir fica bem mais em conta 👀", 2),
                new CommunityPostSeed("Compra, venda e troca", "vendo uns livros do curso, estão bem conservados!", 2),
                new CommunityPostSeed("Vida Universitária UTFPR", "café antes da aula devia contar como crédito acadêmico ☕", 2),
                new CommunityPostSeed("Compra, venda e troca", "troco calculadora científica por livros de programação, alguém?", 3),
                new CommunityPostSeed("Engenharia de Computação", "alguém já fez iniciação científica? queria saber como funciona", 3),
                new CommunityPostSeed("Grupo de Estudos", "bora montar um grupo pra estudar pra prova de circuitos!", 3),
                new CommunityPostSeed("Engenharia de Computação", "finalmente meu código compilou de primeira. hoje é meu dia 😅", 4),
                new CommunityPostSeed("Compra, venda e troca", "tenho umas apostilas sobrando, posso doar pra quem precisar", 4),
                new CommunityPostSeed("Vida Universitária UTFPR", "tem algum lugar bom pra estudar no campus depois das 18h?", 4));

        for (CommunityPostSeed seed : posts) {
            communityRepository.findByName(seed.communityName())
                    .orElseThrow(() -> new IllegalStateException(
                            "A comunidade padrão não foi criada: " + seed.communityName()));
            User author = users.get(seed.authorIndex());
            if (!postRepository.existsByAuthorIdAndContentAndCommunityName(
                    author.getId(), seed.content(), seed.communityName())) {
                postRepository.save(new Post(
                        author.getId(),
                        author.getName(),
                        author.getUsername(),
                        author.getInstitutionName(),
                        author.getCampus(),
                        seed.content(),
                        "PUBLIC",
                        seed.communityName(),
                        List.of(),
                        List.of()));
            }
        }
    }

    private User seedUser(String legacyUsername, String username, String name, String course, int academicPeriod) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByUsername(legacyUsername))
                .orElseGet(() -> {
            User newUser = new User(
                    username,
                    name,
                    username + "@example.test",
                    passwordEncoder.encode(UUID.randomUUID().toString()));
            newUser.completeOnboarding(INSTITUTION, DOMAIN, CAMPUS, course, academicPeriod);
            return newUser;
        });
        user.updateDemoProfile(name, username);
        if (!user.isOnboardingCompleted()) {
            user.completeOnboarding(INSTITUTION, DOMAIN, CAMPUS, course, academicPeriod);
        }
        return userRepository.save(user);
    }

    private record CommunityPostSeed(String communityName, String content, int authorIndex) {
    }
}
