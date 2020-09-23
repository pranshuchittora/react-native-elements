import * as React from 'react';
import { Tile } from 'react-native-elements';
import Playground from '../playground';
import { useView, PropTypes } from 'react-view';
import createReactViewBaseConfig from '../utils/createReactViewBaseConfig';

const props = {
  activeOpacity: {
    value: 0.2,
    type: PropTypes.Number,
  },
  caption: {
    value: 'Tile caption',
    type: PropTypes.String,
    description: '',
  },
};

const TilePlayground = () => {
  const params = useView({
    ...createReactViewBaseConfig('Tile', Tile),
    props,
  });

  return (
    <React.Fragment>
      <Playground params={params} />
    </React.Fragment>
  );
};

export default TilePlayground;
