import Slider from '@components/Slider/Slider';
import ButtonCircle from '@components/Button/ButtonCircle';

const CircleButtons: React.FC = () => (
  <Slider touch={true}> {/* drag habilitado */}
    <ButtonCircle icon="music_note" text="Música" url="list" />
    <ButtonCircle icon="sports_football" text="Deportes" url="list" />
    <ButtonCircle icon="palette" text="Arte" url="list" />
    <ButtonCircle icon="theater_comedy" text="Teatro" url="list" />
    <ButtonCircle icon="computer" text="Tecnología" url="list" />
    <ButtonCircle icon="restaurant" text="Gastronomía" url="list" />
  </Slider>
);

export default CircleButtons;
