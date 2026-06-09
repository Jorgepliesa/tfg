import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Memorial } from '../../entities/Memorial';

export class MemorialSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const repo = dataSource.getRepository(Memorial);

        const memorials = [
            {
                name: 'El corazón en forma',
                description: 'El ejercicio regular fortalece el músculo cardíaco, haciendo que el corazón bombee sangre de forma más eficiente. Con tan solo 20 minutos al día de actividad moderada, tu corazón se vuelve más fuerte y resistente.',
                image: '',
            },
            {
                name: 'Pulmones de acero',
                description: 'La actividad física aumenta la capacidad pulmonar. Con el ejercicio, tus pulmones aprenden a extraer más oxígeno del aire, lo que te da más energía durante el día.',
                image: '',
            },
            {
                name: 'Huesos fuertes',
                description: 'El ejercicio de impacto moderado estimula la formación de hueso nuevo. Saltar, correr y caminar son actividades que mantienen tus huesos densos y resistentes a las fracturas.',
                image: '',
            },
            {
                name: 'El secreto del buen humor',
                description: 'Cuando haces ejercicio, tu cerebro libera endorfinas, conocidas como las "hormonas de la felicidad". Por eso te sientes mejor después de una sesión de actividad física.',
                image: '',
            },
            {
                name: 'Músculos en crecimiento',
                description: 'Los músculos crecen y se fortalecen cuando los ejercitas regularmente. Cada sesión de entrenamiento crea pequeñas fibras musculares nuevas que te hacen más fuerte.',
                image: '',
            },
            {
                name: 'Dormir mejor',
                description: 'El ejercicio regular mejora la calidad del sueño. Las personas que se mueven durante el día se duermen más fácilmente y descansan más profundamente por la noche.',
                image: '',
            },
            {
                name: 'El cerebro también entrena',
                description: 'La actividad física mejora la memoria y la concentración. El ejercicio aumenta el flujo de sangre al cerebro y favorece la creación de nuevas conexiones neuronales.',
                image: '',
            },
            {
                name: 'Sistema inmune activo',
                description: 'El ejercicio moderado refuerza las defensas del cuerpo. Las personas activas tienen menos probabilidad de resfriarse y sus cuerpos combaten mejor las infecciones.',
                image: '',
            },
            {
                name: 'Energía para todo el día',
                description: 'Aunque parezca contradictorio, gastar energía haciendo ejercicio te da más energía. El cuerpo se vuelve más eficiente produciendo y usando la energía que necesita.',
                image: '',
            },
            {
                name: 'El poder del equilibrio',
                description: 'Los ejercicios de equilibrio fortalecen los músculos pequeños que rodean las articulaciones. Un buen equilibrio previene caídas y mejora la coordinación en todas las actividades.',
                image: '',
            },
            {
                name: 'Flexibilidad es libertad',
                description: 'Los estiramientos mantienen los músculos largos y flexibles. Una buena flexibilidad reduce el riesgo de lesiones y hace que los movimientos del día a día sean más cómodos.',
                image: '',
            },
            {
                name: 'El superhéroe interior',
                description: 'Cada vez que completas una sesión de ejercicio, tu cerebro registra ese logro y genera confianza. Con el tiempo, te sientes más capaz de afrontar cualquier reto.',
                image: '',
            },
        ];

        for (const m of memorials) {
            const exists = await repo.findOne({ where: { name: m.name } });
            if (!exists) {
                await repo.save(repo.create(m));
                console.log(`  ✓ Memorial: ${m.name}`);
            }
        }
    }
}